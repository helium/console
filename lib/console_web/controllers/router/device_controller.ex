defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo

  alias Console.Flows
  alias Console.Labels
  alias Console.Devices
  alias Console.Devices.Device
  alias Console.Channels
  alias Console.Organizations
  alias Console.DeviceStats
  alias Console.HotspotStats
  alias Console.Events
  alias Console.DcPurchases
  alias Console.DcPurchases.DcPurchase
  alias Console.Email
  alias Console.Mailer
  alias Console.AlertEvents

  @stripe_api_url "https://api.stripe.com"
  @headers [
    {"Authorization", "Bearer #{Application.get_env(:console, :stripe_secret_key)}"},
    {"Content-Type", "application/x-www-form-urlencoded"}
  ]

  def index(conn, _) do
    devices = Devices.list_devices_no_disco_mode()

    render(conn, "index.json", devices: devices)
  end

  def show(conn, %{"id" => _, "dev_eui" => dev_eui, "app_eui" => app_eui}) do
    devices = Devices.get_by_dev_eui_app_eui(dev_eui, app_eui)

    render(conn, "devices.json", devices: devices)
  end

  def show(conn, %{"id" => id}) do
    case Devices.get_device(id) |> Repo.preload([:multi_buy, :config_profile, labels: [:multi_buy]]) do
      %Device{} = device ->
        config_profile =
          case length(device.labels) do
            0 ->
              if device.config_profile do device.config_profile else nil end
            _ ->
              device_labels =
                Labels.get_labels_of_device_in_order_of_attachment(device)
                |> Repo.preload([label: [:config_profile]])
              first_device_label_with_config_profile = Enum.find(device_labels,fn dl -> dl.label.config_profile_id != nil end)
              if first_device_label_with_config_profile do
                first_device_label_with_config_profile.label.config_profile
              else
                if device.config_profile do device.config_profile else nil end
              end
          end

        adr_allowed =
          case config_profile do
            nil -> false
            _ -> config_profile.adr_allowed
          end

        cf_list_enabled =
          case config_profile do
            nil -> false
            _ -> config_profile.cf_list_enabled
          end

        multi_buy_value =
          case length(device.labels) do
            0 ->
              case device.multi_buy_id do
                nil -> 1
                _ -> if device.multi_buy.value == 10, do: 9999, else: device.multi_buy.value
              end
            _ ->
              label_multi_buys =
                device.labels
                |> Enum.map(fn l -> l.multi_buy end)
                |> Enum.filter(fn mb -> mb != nil end)
                |> Enum.map(fn mb -> mb.value end)

              case length(label_multi_buys) do
                0 ->
                  case device.multi_buy_id do
                    nil -> 1
                    _ -> if device.multi_buy.value == 10, do: 9999, else: device.multi_buy.value
                  end
                _ ->
                  max_value = Enum.max(label_multi_buys)
                  case device.multi_buy_id do
                    nil -> if max_value == 10, do: 9999, else: max_value
                    _ -> if device.multi_buy.value == 10, do: 9999, else: device.multi_buy.value
                  end
              end
          end

        # get all flows connected to single device
        device_flows = Flows.get_flows_with_device_id(device.organization_id, device.id)

        # get all flows connected to associated labels
        label_flows =
          Enum.map(device.labels, fn label ->
            Flows.get_flows_with_label_id(label.organization_id, label.id)
          end)
          |> List.flatten()

        # deduplicate above flows, fetch associated function and channel, check for not active functions and remove
        deduped_flows =
          device_flows ++ label_flows
          |> Enum.reduce([], fn flow, acc ->
            case Enum.find(acc, fn x -> x.function_id == flow.function_id and x.channel_id == flow.channel_id end) do
              nil -> [flow | acc]
              _ -> acc
            end
          end)
          |> Repo.preload([:channel, :function])
          |> Enum.reduce([], fn flow, acc ->
            if flow.function_id != nil and not flow.function.active do
              case Enum.find(acc, fn x -> x.function_id == nil and x.channel_id == flow.channel_id end) do
                nil -> [ Map.merge(flow, %{ function: nil, function_id: nil }) | acc]
                _ -> acc
              end
            else
              case Enum.find(acc, fn x -> x.function_id == flow.function_id and x.channel_id == flow.channel_id end) do
                nil -> [flow | acc]
                _ -> acc
              end
            end
          end)

        channels =
          Enum.map(deduped_flows, fn flow ->
            Map.put(flow.channel, :function, flow.function)
          end)

        final_device =
          device
          |> Map.put(:adr_allowed, adr_allowed)
          |> Map.put(:cf_list_enabled, cf_list_enabled)
          |> Map.put(:multi_buy, multi_buy_value)
          |> Map.put(:channels, channels)

        render(conn, "show.json", device: final_device)
      _ ->
        conn
        |> send_resp(404, "")
    end
  end

  def add_device_event(conn, %{"device_id" => device_id} = event) do
    event = event
      |> Map.put("reported_at_epoch", event["reported_at"])
      |> Map.put("router_uuid", event["id"])
      |> Map.delete("id")

    event = case event["category"] do
      category when category in ["uplink", "join_request", "join_accept", "uplink_dropped"] ->
        cond do
          is_integer(event["data"]["fcnt"]) -> event |> Map.put("frame_up", event["data"]["fcnt"])
          event["data"]["fcnt"] != nil and Integer.parse(event["data"]["fcnt"]) != :error -> event |> Map.put("frame_up", event["data"]["fcnt"])
          true -> event |> Map.put("frame_up", nil)
        end
      category when category in ["downlink", "downlink_dropped"] ->
        cond do
          is_integer(event["data"]["fcnt"]) -> event |> Map.put("frame_down", event["data"]["fcnt"])
          event["data"]["fcnt"] != nil and Integer.parse(event["data"]["fcnt"]) != :error -> event |> Map.put("frame_down", event["data"]["fcnt"])
          true -> event |> Map.put("frame_down", nil)
        end
      _ -> event
    end

    # store info before updating device
    event_device = Devices.get_device(device_id) |> Repo.preload([:labels])

    case event_device do
      nil ->
        conn
        |> send_resp(404, "")
      %Device{} = device ->
        organization = Organizations.get_organization!(device.organization_id)
        prev_dc_balance = organization.dc_balance

        result =
          Ecto.Multi.new()
          |> Ecto.Multi.run(:event, fn _repo, _ ->
            event = case event["data"]["req"]["body"] do
              nil -> event
              _ ->
                cond do
                  String.length(event["data"]["req"]["body"]) > 2500 ->
                    Kernel.put_in(event["data"]["req"]["body"], "Request body is too long and cannot be displayed properly.")
                  String.contains?(event["data"]["req"]["body"], <<0>>) or String.contains?(event["data"]["req"]["body"], <<1>>) or String.contains?(event["data"]["req"]["body"], "\\u0000") ->
                    Kernel.put_in(event["data"]["req"]["body"], "Request body contains unprintable characters when encoding to Unicode and cannot be displayed properly.")
                  true ->
                    event
                end
            end

            event = case event["data"]["req"]["body"] do
              nil -> event
              _ ->
                case Poison.decode(event["data"]["req"]["body"]) do
                  {:ok, decoded_body} -> Kernel.put_in(event["data"]["req"]["body"], decoded_body)
                  _ -> event
                end
            end

            event = case event["data"]["payload"] do
              nil -> event
              _ ->
                if String.contains?(event["data"]["payload"], <<0>>) or String.contains?(event["data"]["payload"], <<1>>) do
                  b64_payload = event["data"]["payload"] |> :base64.encode
                  Kernel.put_in(event["data"]["payload"], "Payload contains unprintable Unicode characters, (#{b64_payload} in Base64)")
                else
                  event
                end
            end

            Events.create_event(Map.put(event, "organization_id", organization.id))
          end)
          |> Ecto.Multi.run(:device, fn _repo, %{ event: event } ->
            dc_used =
              case event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or event.category == "join_request" do
                true -> event.data["dc"]["used"]
                false -> 0
              end
            packet_count = if dc_used == 0, do: 0, else: 1

            device_updates = %{
              "last_connected" => event.reported_at_naive,
              "total_packets" => device.total_packets + packet_count,
              "dc_usage" => device.dc_usage + dc_used,
              "in_xor_filter" => true
            }

            device_updates = cond do
              is_integer(event.frame_up) -> device_updates |> Map.put("frame_up", event.frame_up)
              is_integer(event.frame_down) -> device_updates |> Map.put("frame_down", event.frame_down)
              true -> device_updates
            end

            Devices.update_device(device, device_updates, "router")
          end)
          |> Ecto.Multi.run(:device_stat, fn _repo, %{ event: event, device: device } ->
            if event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or event.category == "join_request" do
              DeviceStats.create_stat(%{
                "router_uuid" => event.router_uuid,
                "payload_size" => event.data["payload_size"],
                "dc_used" => event.data["dc"]["used"],
                "reported_at_epoch" => event.reported_at_epoch,
                "device_id" => device.id,
                "organization_id" => device.organization_id
              })
            else
              {:ok, %{}}
            end
          end)
          |> Ecto.Multi.run(:hotspot_stat, fn _repo, %{ event: event, device: device } ->
            if event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or event.category == "join_request" do
              HotspotStats.create_stat(%{
                "router_uuid" => event.router_uuid,
                "hotspot_address" => event.data["hotspot"]["id"],
                "rssi" => event.data["hotspot"]["rssi"],
                "snr" => event.data["hotspot"]["snr"],
                "channel" => event.data["hotspot"]["channel"],
                "spreading" => event.data["hotspot"]["spreading"],
                "category" => event.category,
                "sub_category" => event.sub_category,
                "reported_at_epoch" => event.reported_at_epoch,
                "device_id" => device.id,
                "organization_id" => device.organization_id
              })
            else
              {:ok, %{}}
            end
          end)
          |> Ecto.Multi.run(:organization, fn _repo, %{ device: _device, event: created_event } ->
            if event["sub_category"] in ["uplink_confirmed", "uplink_unconfirmed"] or event["category"] == "join_request" do
              cond do
                organization.dc_balance_nonce == event["data"]["dc"]["nonce"] ->
                  Organizations.update_organization(organization, %{ "dc_balance" => event["data"]["dc"]["balance"] })
                organization.dc_balance_nonce - 1 == event["data"]["dc"]["nonce"] ->
                  {:ok, updated_org} = Organizations.update_organization(organization, %{ "dc_balance" => organization.dc_balance - created_event.data["dc"]["used"] })
                  ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(updated_org)

                  {:ok, updated_org}
                true ->
                  {:error, "DC balance nonce inconsistent between router and console"}
              end
            else
              {:ok, organization}
            end
          end)
          |> Repo.transaction()

        with {:ok, %{ event: event, device: device, organization: organization }} <- result do
          publish_created_event(event, device)

          if event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] do
            check_org_dc_balance(organization, prev_dc_balance)
          end

          if event_device.last_connected == nil do
            { _, time } = Timex.format(Timex.now, "%H:%M:%S UTC", :strftime)
            details = %{
              device_name: event_device.name,
              time: time,
              hotspot: case event.data["hotspot"] != nil do
                false -> nil
                true -> event.data["hotspot"]
              end
            }
            device_labels = Enum.map(event_device.labels, fn l -> l.id end)
            AlertEvents.notify_alert_event(event_device.id, "device", "device_join_otaa_first_time", details, device_labels)
          end

          case event.category do
            "uplink" ->
              if event.data["integration"] != nil and event.data["integration"]["id"] != "no_channel" do
                event_integration = Channels.get_channel(event.data["integration"]["id"])

                if event_integration != nil do
                  if event_integration.time_first_uplink == nil do
                    Channels.update_channel(event_integration, organization, %{ time_first_uplink: event.reported_at_naive })
                    { _, time } = Timex.format(event.reported_at_naive, "%H:%M:%S UTC", :strftime)
                    details = %{ time: time, channel_name: event_integration.name, channel_id: event_integration.id }
                    AlertEvents.notify_alert_event(event_integration.id, "integration", "integration_receives_first_event", details)
                  end

                  if event.data["integration"]["status"] != "success" do
                    { _, time } = Timex.format(event.reported_at_naive, "%H:%M:%S UTC", :strftime)
                    details = %{
                      channel_name: event_integration.name,
                      channel_id: event_integration.id,
                      time: time
                    }
                    limit = %{ time_buffer: Timex.shift(Timex.now, hours: -1) }
                    AlertEvents.notify_alert_event(event_integration.id, "integration", "integration_stops_working", details, nil, limit)
                    Channels.update_channel(event_integration, organization, %{ last_errored: true })
                  else
                    Channels.update_channel(event_integration, organization, %{ last_errored: false })
                  end
                end
              end
            "downlink" ->
              if event.sub_category == "downlink_dropped" do
                details = %{ device_id: event_device.id, device_name: event_device.name }
                device_labels = Enum.map(event_device.labels, fn l -> l.id end)
                limit = %{ time_buffer: Timex.shift(Timex.now, hours: -1) }
                AlertEvents.notify_alert_event(event_device.id, "device", "downlink_unsuccessful", details, device_labels, limit)
              end
            _ -> nil
          end

          conn
          |> send_resp(200, "")
        end
    end
  end

  defp publish_created_event(event, device) do
    event = Map.merge(event, %{
      device_name: device.name
    })

    event_to_publish =
      event
      |> Map.from_struct()
      |> Map.delete(:__meta__)
      |> Map.delete(:__struct__)
      |> Map.delete(:device)
      |> Map.delete(:organization)

    ConsoleWeb.Endpoint.broadcast("graphql:events_dashboard", "graphql:events_dashboard:#{device.id}:new_event", event_to_publish)
    ConsoleWeb.Endpoint.broadcast("graphql:device_show_debug", "graphql:device_show_debug:#{device.id}:new_event", event_to_publish)

    label_ids = Labels.get_labels_of_device(device) |> Enum.map(fn dl -> dl.label_id end)
    Enum.each(label_ids, fn id ->
      ConsoleWeb.Endpoint.broadcast("graphql:label_show_debug", "graphql:label_show_debug:#{id}:new_event", event_to_publish)
    end)

    if event.data["hotspot"] != nil and event.data["hotspot"]["id"] != nil do
      ConsoleWeb.Endpoint.broadcast(
        "graphql:coverage_hotspot_show_debug",
        "graphql:coverage_hotspot_show_debug:#{event.organization_id}_#{event.data["hotspot"]["id"]}:new_event",
        event_to_publish
      )
    end
  end

  defp check_org_dc_balance(organization, prev_dc_balance) do
    if organization.automatic_charge_amount == nil do
      cond do
        prev_dc_balance > 500_000 and organization.dc_balance <= 500_000 ->
          # DC Balance has dipped below 500,000. Send a notice.
          Organizations.get_administrators(organization)
          |> Enum.each(fn administrator ->
            Email.dc_balance_notification_email(organization, administrator.email, organization.dc_balance)
            |> Mailer.deliver_later()
          end)
        prev_dc_balance > 0 and organization.dc_balance <= 0 ->
          # DC Balance has gone to zero. Send a notice.
          Organizations.get_administrators(organization)
          |> Enum.each(fn administrator ->
            Email.dc_balance_notification_email(organization, administrator.email, 0) |> Mailer.deliver_later()
          end)
        true -> nil
      end
    end

    if organization.automatic_charge_amount != nil
      and organization.automatic_payment_method != nil
      and organization.dc_balance < 500000
      and not organization.pending_automatic_purchase do

        {:ok, updated_org_pending_result} =
          Repo.transaction(fn ->
            organization = Organizations.get_organization!(organization.id)
            if organization.pending_automatic_purchase do
              nil
            else
              Organizations.update_organization!(organization, %{ "pending_automatic_purchase" => true })
            end
          end)

        case updated_org_pending_result do
          nil -> nil
          organization ->
            request_body = URI.encode_query(%{
              "customer" => organization.stripe_customer_id,
              "amount" => organization.automatic_charge_amount,
              "currency" => "usd",
              "payment_method" => organization.automatic_payment_method,
              "off_session" => "true",
              "confirm" => "true",
            })

            with {:ok, stripe_response} <- HTTPoison.post("#{@stripe_api_url}/v1/payment_intents", request_body, @headers) do
              with 200 <- stripe_response.status_code do
                payment_intent = Poison.decode!(stripe_response.body)

                with "succeeded" <- payment_intent["status"],
                  {:ok, stripe_response} <- HTTPoison.get("#{@stripe_api_url}/v1/payment_methods/#{payment_intent["payment_method"]}", @headers),
                  200 <- stripe_response.status_code do
                    card = Poison.decode!(stripe_response.body)

                    attrs = %{
                      "dc_purchased" => payment_intent["amount"] * 1000,
                      "cost" => payment_intent["amount"],
                      "card_type" => card["card"]["brand"],
                      "last_4" => card["card"]["last4"],
                      "user_id" => "Recurring Charge",
                      "organization_id" => organization.id,
                      "payment_id" => payment_intent["id"],
                    }

                    with {:ok, %DcPurchase{} = dc_purchase } <- DcPurchases.create_dc_purchase_update_org(attrs, organization) do
                      organization = Organizations.get_organization!(organization.id)
                      Organizations.get_administrators(organization)
                      |> Enum.each(fn administrator ->
                        Email.dc_top_up_notification_email(organization, dc_purchase, administrator.email)
                        |> Mailer.deliver_later()
                      end)
                      ConsoleWeb.Endpoint.broadcast("graphql:dc_purchases_table", "graphql:dc_purchases_table:#{organization.id}:update_dc_table", %{})
                      ConsoleWeb.Endpoint.broadcast("graphql:dc_index", "graphql:dc_index:#{organization.id}:update_dc", %{})
                      ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(organization)
                    end
                end
              end
            end
        end
    end
  end

  def update_devices_in_xor_filter(conn, %{"added" => added_device_ids, "removed" => removed_device_ids}) do
    removed_devices = Devices.get_devices_in_list(removed_device_ids)
    if length(removed_devices) > 0 do
      ids_to_report = removed_devices |> Enum.map(fn d -> d.id end)
      Appsignal.send_error(%RuntimeError{ message: Enum.join(ids_to_report, ", ") }, "Removed devices in XOR filter that exist", ["router/device_controller.ex/update_devices_in_xor_filter"])
    end

    if length(added_device_ids) > 0 do
      with {:ok, devices} <- Devices.update_in_xor_filter(added_device_ids) do
        Enum.map(devices,fn (d) -> d.organization_id end)
        |> Enum.uniq()
        |> Enum.each(fn org_id ->
          Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
            ConsoleWeb.Endpoint.broadcast("graphql:devices_index_table", "graphql:devices_index_table:#{org_id}:device_list_update", %{})
            ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar", "graphql:device_index_labels_bar:#{org_id}:label_list_update", %{})
            ConsoleWeb.Endpoint.broadcast("graphql:xor_filter_update", "graphql:xor_filter_update:#{org_id}:organization_xor_filter_update", %{})
          end)
        end)
        conn |> send_resp(200, "")
      end
    else
      conn |> send_resp(200, "")
    end
  end
end
