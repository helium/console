defmodule Console.EtlWorker do
  use GenServer
  alias Console.Repo
  alias Console.Devices
  alias Console.Organizations
  alias Console.AlertEvents

  def start_link(initial_state) do
    GenServer.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  def init(_opts) do
    if Application.get_env(:console, :use_amqp_events) do
      schedule_events_etl(10)
    end
    {:ok, %{}}
  end

  def handle_info(:run_events_etl, state) do
    events = ConsoleWeb.Monitor.get_events_state()
    delivery_tags = Enum.map(events, fn e -> elem(e, 0) end)

    Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
      try do
        parsed_events = Enum.map(events, fn e -> elem(e, 1) |> Jason.decode!() end)

        if length(parsed_events) > 0 do
          device_updates_map = generate_device_updates_map(parsed_events)

          devices_to_update =
            device_updates_map
            |> Map.keys()
            |> Devices.get_devices_in_list()

          organization_updates_map = generate_organization_updates_map(device_updates_map, devices_to_update)

          organizations_to_update =
            organization_updates_map
            |> Map.keys()
            |> Organizations.get_organizations_in_list()

          events_to_run_stats =
            parsed_events
            |> Enum.filter(fn event ->
              event["sub_category"] in ["uplink_confirmed", "uplink_unconfirmed"] or event["category"] == "join_request"
            end)

          device_and_hotspot_stats = generate_device_and_hotspot_stats(events_to_run_stats, devices_to_update)

          result =
            Ecto.Multi.new()
            |> Ecto.Multi.run(:device_updates, fn _repo, _ ->
              Enum.each(devices_to_update, fn device ->
                new_total_packets = device.total_packets + device_updates_map[device.id]["total_packets"]
                new_dc_usage = device.dc_usage + device_updates_map[device.id]["dc_usage"]

                device_attrs = Map.merge(device_updates_map[device.id], %{
                  "total_packets" => new_total_packets,
                  "dc_usage" => new_dc_usage
                })

                Devices.update_device!(device, device_attrs, "router")
              end)
              {:ok, "success"}
            end)
            |> Ecto.Multi.run(:organization_updates, fn _repo, _ ->
              Enum.each(organizations_to_update, fn org ->
                org_attrs = %{
                  "dc_balance" => Enum.max([org.dc_balance - organization_updates_map[org.id]["dc_used"], 0]),
                }

                Organizations.update_organization!(org, org_attrs)

                if (org.dc_balance_nonce != organization_updates_map[org.id]["nonce"]) do
                  ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(
                    Map.put(org, :dc_balance, org_attrs["dc_balance"])
                  )
                end
              end)
              {:ok, "success"}
            end)
            |> Ecto.Multi.run(:device_stats, fn _repo, _ ->
              device_stats =
                device_and_hotspot_stats
                |> Enum.map(fn tuple -> elem(tuple, 0) end)
              with { _count , nil} <- Repo.insert_all("device_stats", device_stats) do
                {:ok, "success"}
              end
            end)
            |> Ecto.Multi.run(:hotspot_stats, fn _repo, _ ->
              hotspot_stats =
                device_and_hotspot_stats
                |> Enum.map(fn tuple -> elem(tuple, 1) end)
              with { _count , nil} <- Repo.insert_all("hotspot_stats", hotspot_stats) do
                {:ok, "success"}
              end
            end)
            |> Repo.transaction()

          with {:ok, _} <- result do
            ConsoleWeb.MessageQueue.ack(delivery_tags)
            ConsoleWeb.Monitor.remove_from_events_state(length(events))

            Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
              check_updated_orgs_dc_balance(organizations_to_update)
              alert_newly_connected_devices(devices_to_update, parsed_events)
              run_other_event_alerts(parsed_events)
            end) # run in separate task so that failures here do not get caught and sent to rescue block, which will double ack messages
          end
        end
      rescue
        error ->
          ConsoleWeb.MessageQueue.reject(delivery_tags)
          ConsoleWeb.Monitor.remove_from_events_state(length(events))
          Appsignal.send_error(error, "Failed to process in ETL Worker", ["etl_worker"])
      end
    end)
    |> Task.await(:infinity)

    schedule_events_etl(1)
    {:noreply, state}
  end

  defp schedule_events_etl(wait_time) do
    Process.send_after(self(), :run_events_etl, wait_time)
  end

  defp generate_device_and_hotspot_stats(events_to_run_stats, devices_to_update) do
    events_to_run_stats
    |> Enum.map(fn event ->
      organization_id =
        case Enum.find(devices_to_update, fn d -> d.id == event["device_id"] end) do
          nil -> nil
          device -> Ecto.UUID.dump!(device.organization_id)
        end
      device_id = Ecto.UUID.dump!(event["device_id"])

      {
        %{
          "id" => Ecto.UUID.bingenerate(),
          "router_uuid" => event["router_uuid"],
          "payload_size" => event["data"]["payload_size"],
          "dc_used" => event["data"]["dc"]["used"],
          "reported_at_epoch" => event["reported_at_epoch"],
          "device_id" => device_id,
          "organization_id" => organization_id,
          "updated_at" => NaiveDateTime.utc_now(),
          "inserted_at" => NaiveDateTime.utc_now()
        },
        %{
          "id" => Ecto.UUID.bingenerate(),
          "router_uuid" => event["router_uuid"],
          "hotspot_address" => event["data"]["hotspot"]["id"],
          "rssi" => event["data"]["hotspot"]["rssi"],
          "snr" => event["data"]["hotspot"]["snr"],
          "channel" => event["data"]["hotspot"]["channel"],
          "spreading" => event["data"]["hotspot"]["spreading"],
          "category" => event["category"],
          "sub_category" => event["sub_category"],
          "reported_at_epoch" => event["reported_at_epoch"],
          "device_id" => device_id,
          "organization_id" => organization_id,
          "updated_at" => NaiveDateTime.utc_now(),
          "inserted_at" => NaiveDateTime.utc_now()
        },
        organization_id
      }
    end)
    |> Enum.filter(fn tuple -> elem(tuple, 2) != nil end)
  end

  defp generate_organization_updates_map(device_updates_map, devices_to_update) do
    devices_to_update
    |> Enum.reduce(%{}, fn device, acc ->
      if device_updates_map[device.id]["dc_usage"] > 0 do
        update_attrs =
          case acc[device.organization_id] do
            nil ->
              %{
                "dc_used" => device_updates_map[device.id]["dc_usage"],
                "nonce" => device_updates_map[device.id]["nonce"]
              }
            _ ->
              %{
                "dc_used" => device_updates_map[device.id]["dc_usage"] + acc[device.organization_id]["dc_used"],
                "nonce" => Enum.max([device_updates_map[device.id]["nonce"], acc[device.organization_id]["nonce"]])
              }
          end

        Map.merge(acc, %{ device.organization_id => update_attrs })
      else
        acc
      end
    end)
  end

  defp generate_device_updates_map(parsed_events) do
    parsed_events
    |> Enum.reduce(%{}, fn event, acc ->
      dc_used =
        case event["sub_category"] in ["uplink_confirmed", "uplink_unconfirmed"] or event["category"] == "join_request" do
          true -> event["data"]["dc"]["used"]
          false -> 0
        end
      packet_count = if dc_used == 0, do: 0, else: 1
      nonce =
        case event["sub_category"] in ["uplink_confirmed", "uplink_unconfirmed"] or event["category"] == "join_request" do
          true -> event["data"]["dc"]["nonce"]
          false -> 0
        end
      reported_at_naive = event["reported_at"] |> DateTime.from_unix!(:millisecond) |> DateTime.to_naive()

      update_attrs =
        case acc[event["device_id"]] do
          nil ->
            %{
              "last_connected" => reported_at_naive,
              "total_packets" => packet_count,
              "dc_usage" => dc_used,
              "in_xor_filter" => true,
              "nonce" => nonce
            }
          _ ->
            %{
              "last_connected" => reported_at_naive,
              "total_packets" => packet_count + acc[event["device_id"]]["total_packets"],
              "dc_usage" => dc_used + acc[event["device_id"]]["dc_usage"],
              "in_xor_filter" => true,
              "nonce" => Enum.max([nonce, acc[event["device_id"]]["nonce"]])
            }
        end

      update_attrs =
        cond do
          is_integer(event["frame_up"]) and (update_attrs["frame_up"] == nil or event["frame_up"] > update_attrs["frame_up"]) ->
            update_attrs |> Map.put("frame_up", event["frame_up"])
          is_integer(event["frame_down"]) and (update_attrs["frame_down"] == nil or event["frame_down"] > update_attrs["frame_down"]) ->
            update_attrs |> Map.put("frame_down", event["frame_down"])
          true -> update_attrs
        end

      Map.merge(acc, %{ event["device_id"] => update_attrs })
    end)
  end

  defp check_updated_orgs_dc_balance(organizations_to_update) do
    zipped_orgs_before_after =
      organizations_to_update
      |> Enum.map(fn org -> org.id end)
      |> Organizations.get_organizations_in_list()
      |> Enum.zip(organizations_to_update)

    Enum.each(zipped_orgs_before_after, fn tuple ->
      ConsoleWeb.Router.DeviceController.check_org_dc_balance(elem(tuple, 0), elem(tuple, 1).dc_balance)
    end)
  end

  defp alert_newly_connected_devices(devices_to_update, parsed_events) do
    newly_connected_devices =
      devices_to_update
      |> Enum.filter(fn d -> d.last_connected == nil end)
      |> Repo.preload([:labels])

    Enum.each(newly_connected_devices, fn d ->
      event_to_alert =
        parsed_events
        |> Enum.reverse()
        |> Enum.find(fn e ->
          e["device_id"] == d.id
        end)

      { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
      details = %{
        device_name: d.name,
        time: time,
        hotspot: case event_to_alert["data"]["hotspot"] != nil do
          false -> nil
          true -> event_to_alert["data"]["hotspot"]
        end
      }
      device_labels = Enum.map(d.labels, fn l -> l.id end)
      AlertEvents.notify_alert_event(d.id, "device", "device_join_otaa_first_time", details, device_labels)
    end)
  end

  defp run_other_event_alerts(parsed_events) do
    parsed_events
    |> Enum.map(fn e ->
      Map.new(e, fn {k, v} -> {String.to_atom(k), v} end)
    end)
    |> Enum.each(fn event ->
      case event.category do
        "uplink" ->
          ConsoleWeb.Router.DeviceController.check_event_integration_alerts(event)
        "downlink" ->
          if event.sub_category == "downlink_dropped" do
            event_device =
              Devices.get_device(event.device_id) |> Repo.preload([:labels])

            details = %{ device_id: event_device.id, device_name: event_device.name }
            device_labels = Enum.map(event_device.labels, fn l -> l.id end)
            limit = %{ time_buffer: Timex.shift(Timex.now, hours: -1) }
            AlertEvents.notify_alert_event(event_device.id, "device", "downlink_unsuccessful", details, device_labels, limit)
          end
        "misc" ->
          ConsoleWeb.Router.DeviceController.check_misc_integration_error_alert(event)
        _ -> nil
      end
    end)
  end
end
