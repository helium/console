defmodule Console.EtlErrorWorker do
  use GenServer
  alias Console.Repo
  alias Console.Devices
  alias Console.Organizations
  alias Console.AlertEvents
  alias Console.DeviceStats
  alias Console.HotspotStats

  def start_link(initial_state) do
    GenServer.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  def init(_opts) do
    if Application.get_env(:console, :use_amqp_events) do
      schedule_events_error_etl(10)
    end
    {:ok, %{}}
  end

  def handle_info(:run_events_error_etl, state) do
    events = ConsoleWeb.Monitor.get_events_error_state()

    Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
      try do
        event = List.last(events)
        if event != nil do
          IO.inspect "PROCESSING EVENT FROM ETL ERROR WORKER..."
          parsed_event = event |> Jason.decode!() |> Map.new(fn {k, v} -> {String.to_atom(k), v} end)

          device = Devices.get_device!(parsed_event.device_id) |> Repo.preload([:labels])
          organization = Organizations.get_organization!(device.organization_id)
          reported_at_naive = parsed_event.reported_at |> DateTime.from_unix!(:millisecond) |> DateTime.to_naive()

          result =
            Ecto.Multi.new()
            |> Ecto.Multi.run(:device, fn _repo, _ ->
              dc_used =
                case parsed_event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or parsed_event.category == "join_request" do
                  true -> parsed_event.data["dc"]["used"]
                  false -> 0
                end
              packet_count = if dc_used == 0, do: 0, else: 1

              device_updates = %{
                "last_connected" => reported_at_naive,
                "total_packets" => device.total_packets + packet_count,
                "dc_usage" => device.dc_usage + dc_used,
                "in_xor_filter" => true
              }

              device_updates = cond do
                is_integer(Map.get(parsed_event, :frame_up)) -> device_updates |> Map.put("frame_up", parsed_event.frame_up)
                is_integer(Map.get(parsed_event, :frame_down)) -> device_updates |> Map.put("frame_down", parsed_event.frame_down)
                true -> device_updates
              end

              Devices.update_device(device, device_updates, "router")
            end)
            |> Ecto.Multi.run(:device_stat, fn _repo, %{ device: device } ->
              if parsed_event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or parsed_event.category == "join_request" do
                DeviceStats.create_stat(%{
                  "router_uuid" => parsed_event.router_uuid,
                  "payload_size" => parsed_event.data["payload_size"],
                  "dc_used" => parsed_event.data["dc"]["used"],
                  "reported_at_epoch" => parsed_event.reported_at_epoch,
                  "device_id" => device.id,
                  "organization_id" => device.organization_id
                })
              else
                {:ok, %{}}
              end
            end)
            |> Ecto.Multi.run(:hotspot_stat, fn _repo, %{ device: device } ->
              if parsed_event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or parsed_event.category == "join_request" do
                HotspotStats.create_stat(%{
                  "router_uuid" => parsed_event.router_uuid,
                  "hotspot_address" => parsed_event.data["hotspot"]["id"],
                  "rssi" => parsed_event.data["hotspot"]["rssi"],
                  "snr" => parsed_event.data["hotspot"]["snr"],
                  "channel" => parsed_event.data["hotspot"]["channel"],
                  "spreading" => parsed_event.data["hotspot"]["spreading"],
                  "category" => parsed_event.category,
                  "sub_category" => parsed_event.sub_category,
                  "reported_at_epoch" => parsed_event.reported_at_epoch,
                  "device_id" => device.id,
                  "organization_id" => device.organization_id
                })
              else
                {:ok, %{}}
              end
            end)
            |> Ecto.Multi.run(:organization, fn _repo, _ ->
              cond do
                parsed_event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or parsed_event.category == "join_request" ->
                  org_attrs =
                    if is_nil(organization.first_packet_received_at) do
                      %{
                        "dc_balance" => Enum.max([organization.dc_balance - parsed_event.data["dc"]["used"], 0]),
                        "first_packet_received_at" => NaiveDateTime.utc_now()
                      }
                    else
                      %{
                        "dc_balance" => Enum.max([organization.dc_balance - parsed_event.data["dc"]["used"], 0]),
                      }
                    end

                  if organization.dc_balance_nonce != parsed_event.data["dc"]["used"] do
                    ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(
                      Map.put(organization, :dc_balance, org_attrs["dc_balance"])
                    )
                  end

                  Organizations.update_organization(organization, org_attrs)

                parsed_event.sub_category == "uplink_dropped_not_enough_dc" ->
                  Organizations.update_organization(organization, %{ "dc_balance" => 0 })

                true ->
                  {:ok, organization}
              end
            end)
            |> Repo.transaction()

          with {:ok, %{ organization: updated_org }} <- result do
            ConsoleWeb.Monitor.remove_from_events_error_state()

            Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
              if parsed_event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or parsed_event.category == "join_request" do
                ConsoleWeb.Router.DeviceController.check_org_dc_balance(updated_org, organization.dc_balance)
              end

              if updated_org.dc_balance <= 0 do
                ConsoleWeb.Router.DeviceController.broadcast_router_org_zero_balance(updated_org)
              end

              if device.last_connected == nil do
                { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
                details = %{
                  device_name: device.name,
                  time: time,
                  hotspot: case parsed_event.data["hotspot"] != nil do
                    false -> nil
                    true -> parsed_event.data["hotspot"]
                  end
                }
                device_labels = Enum.map(device.labels, fn l -> l.id end)
                AlertEvents.notify_alert_event(device.id, "device", "device_join_otaa_first_time", details, device_labels)
              end

              case parsed_event.category do
                "uplink" ->
                  ConsoleWeb.Router.DeviceController.check_event_integration_alerts(parsed_event)
                "downlink" ->
                  if parsed_event.sub_category == "downlink_dropped" do
                    details = %{ device_id: device.id, device_name: device.name }
                    device_labels = Enum.map(device.labels, fn l -> l.id end)
                    limit = %{ time_buffer: Timex.shift(Timex.now, hours: -1) }
                    AlertEvents.notify_alert_event(device.id, "device", "downlink_unsuccessful", details, device_labels, limit)
                  end
                "misc" ->
                  ConsoleWeb.Router.DeviceController.check_misc_integration_error_alert(parsed_event)
                _ -> nil
              end
            end) # run in separate task so that failures here do not get caught and sent to rescue block
          end
        end
      rescue
        error ->
          ConsoleWeb.Monitor.remove_from_events_error_state()
          Appsignal.send_error(error, "Failed to process in ETL Error Worker", __STACKTRACE__)
      end
    end)
    |> Task.await(:infinity)

    schedule_events_error_etl(1)
    {:noreply, state}
  end

  defp schedule_events_error_etl(wait_time) do
    Process.send_after(self(), :run_events_error_etl, wait_time)
  end
end
