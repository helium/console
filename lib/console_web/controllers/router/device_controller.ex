defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo

  alias Console.Flows
  alias Console.Labels
  alias Console.Devices
  alias Console.Devices.Device
  alias Console.Channels
  alias Console.Channels.Channel
  alias Console.CommunityChannels
  alias Console.Organizations
  alias Console.DeviceStats
  alias Console.HotspotStats
  alias Console.Events
  alias Console.DcPurchases
  alias Console.DcPurchases.DcPurchase
  alias Console.Email
  alias Console.Mailer
  alias Console.AlertEvents
  alias ConsoleWeb.Router.DeviceView
  alias Console.OrganizationHotspots

  @stripe_api_url "https://api.stripe.com"
  @headers [
    {"Authorization", "Bearer #{Application.get_env(:console, :stripe_secret_key)}"},
    {"Content-Type", "application/x-www-form-urlencoded"}
  ]

  def index(conn, params) do
    devices = Devices.paginate_devices_no_disco_mode(params["after"])
    parsed_devices = DeviceView.render("index.json", devices: devices)

    last_device = List.last(parsed_devices)
    response =
      case last_device do
        nil ->
          %{
            data: parsed_devices
          }
        _ ->
          %{
            data: parsed_devices,
            after: last_device.id
          }
      end

    conn
    |> send_resp(:ok, Poison.encode!(response))
  end

  def get_by_other_creds(conn, %{"dev_eui" => dev_eui, "app_eui" => app_eui}) do
    devices = Devices.get_by_dev_eui_app_eui(dev_eui, app_eui)

    render(conn, "devices.json", devices: devices)
  end

  def show(conn, %{"id" => id}) do
    case Devices.get_device(id) |> Repo.preload([:packet_config, :config_profile, labels: [:packet_config, :config_profile]]) do
      %Device{} = device ->
        config_profile_to_use =
          case device.config_profile do
            nil ->
              labels_with_config_profiles = Enum.filter(device.labels, fn l -> l.config_profile_id != nil end)
              case length(labels_with_config_profiles) do
                0 ->
                  %{
                    adr_allowed: false,
                    cf_list_enabled: false,
                    rx_delay: 1
                  }
                _ ->
                  device_label = Labels.get_latest_applied_device_label(device.id, Enum.map(labels_with_config_profiles, fn l -> l.id end))
                  label = Enum.find(labels_with_config_profiles, fn l -> l.id == device_label.label_id end)
                  label.config_profile
              end
            _ ->
              device.config_profile
          end

        adr_allowed = config_profile_to_use.adr_allowed
        cf_list_enabled = config_profile_to_use.cf_list_enabled
        rx_delay = config_profile_to_use.rx_delay

        packet_config_to_use =
          case device.packet_config do
            nil ->
              labels_with_packet_configs = Enum.filter(device.labels, fn l -> l.packet_config_id != nil end)
              case length(labels_with_packet_configs) do
                0 ->
                  %{
                    multi_buy_value: 1,
                    preferred_hotspots: []
                  }
                _ ->
                  device_label = Labels.get_latest_applied_device_label(device.id, Enum.map(labels_with_packet_configs, fn l -> l.id end))
                  label = Enum.find(labels_with_packet_configs, fn l -> l.id == device_label.label_id end)
                  cond do
                    label.packet_config.multi_active and not label.packet_config.preferred_active ->
                      multi_buy_value = if label.packet_config.multi_buy_value == 21, do: 9999, else: label.packet_config.multi_buy_value
                      %{
                        multi_buy_value: multi_buy_value,
                        preferred_hotspots: []
                      }
                    label.packet_config.preferred_active and not label.packet_config.multi_active ->
                      organization = Organizations.get_organization!(device.organization_id)
                      preferred_hotspots_addresses = OrganizationHotspots.all_preferred(organization) |> Enum.map(fn oh -> oh.hotspot_address end)
                      %{
                        multi_buy_value: 1,
                        preferred_hotspots: preferred_hotspots_addresses
                      }
                  end
              end
            _ ->
              device.packet_config
              cond do
                device.packet_config.multi_active and not device.packet_config.preferred_active ->
                  multi_buy_value = if device.packet_config.multi_buy_value == 21, do: 9999, else: device.packet_config.multi_buy_value
                  %{
                    multi_buy_value: multi_buy_value,
                    preferred_hotspots: []
                  }
                device.packet_config.preferred_active and not device.packet_config.multi_active ->
                  organization = Organizations.get_organization!(device.organization_id)
                  preferred_hotspots_addresses = OrganizationHotspots.all_preferred(organization) |> Enum.map(fn oh -> oh.hotspot_address end)
                  %{
                    multi_buy_value: 1,
                    preferred_hotspots: preferred_hotspots_addresses
                  }
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

        allowed_types = Channel.get_allowed_integration_types()

        channels =
          Enum.map(deduped_flows, fn flow ->
            Map.put(flow.channel, :function, flow.function)
          end)
          |> Enum.filter(fn channel ->
            channel.type in allowed_types
          end)
          |> Enum.map(fn channel ->
            CommunityChannels.inject_credentials(channel)
          end)

        final_device =
          device
          |> Map.put(:adr_allowed, adr_allowed)
          |> Map.put(:cf_list_enabled, cf_list_enabled)
          |> Map.put(:rx_delay, rx_delay)
          |> Map.put(:multi_buy, packet_config_to_use.multi_buy_value)
          |> Map.put(:preferred_hotspots, packet_config_to_use.preferred_hotspots)
          |> Map.put(:channels, channels)

        render(conn, "show.json", device: final_device)
      _ ->
        conn
        |> send_resp(404, "")
    end
  end

  def add_device_event(conn, %{"device_id" => device_id} = event) do
    if Application.get_env(:console, :use_amqp_events) do
      event_device = Devices.get_device(device_id)

      case event_device do
        nil ->
          conn
          |> send_resp(404, "")
        %Device{} = device ->
          try do
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

            event = case event["data"]["res"]["body"] do
              nil -> event
              _ ->
                cond do
                  String.length(event["data"]["res"]["body"]) > 2500 ->
                    Kernel.put_in(event["data"]["res"]["body"], "Response body is too long and cannot be displayed properly.")
                  String.contains?(event["data"]["res"]["body"], <<0>>) or String.contains?(event["data"]["res"]["body"], <<1>>) or String.contains?(event["data"]["res"]["body"], "\\u0000") ->
                    Kernel.put_in(event["data"]["res"]["body"], "Response body contains unprintable characters when encoding to Unicode and cannot be displayed properly.")
                  true ->
                    event
                end
            end

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

            with {:ok, created_event} <- Events.create_event(Map.put(event, "organization_id", device.organization_id)) do
              ConsoleWeb.MessageQueuePublisher.publish(Jason.encode!(event))
              publish_created_event(created_event, device)

              conn
              |> send_resp(200, "")
            end
          rescue
            error ->
              Appsignal.send_error(error, "Failed to create event", __STACKTRACE__)
          end
      end
    else
      add_device_event_direct(conn, event, device_id)
    end
  end

  defp add_device_event_direct(conn, event, device_id) do
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
        organization = Organizations.get_organization!(event_device.organization_id)
        prev_dc_balance = organization.dc_balance

        result =
          Ecto.Multi.new()
          |> Ecto.Multi.run(:event, fn _repo, _ ->
            event = case event["data"]["res"]["body"] do
              nil -> event
              _ ->
                cond do
                  String.length(event["data"]["res"]["body"]) > 2500 ->
                    Kernel.put_in(event["data"]["res"]["body"], "Response body is too long and cannot be displayed properly.")
                  String.contains?(event["data"]["res"]["body"], <<0>>) or String.contains?(event["data"]["res"]["body"], <<1>>) or String.contains?(event["data"]["res"]["body"], "\\u0000") ->
                    Kernel.put_in(event["data"]["res"]["body"], "Response body contains unprintable characters when encoding to Unicode and cannot be displayed properly.")
                  true ->
                    event
                end
            end

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
          |> Ecto.Multi.run(:organization, fn _repo, %{ event: created_event } ->
            if event["sub_category"] in ["uplink_confirmed", "uplink_unconfirmed"] or event["category"] == "join_request" do
              cond do
                organization.dc_balance_nonce == event["data"]["dc"]["nonce"] ->
                  Organizations.update_organization(organization, %{ "dc_balance" => event["data"]["dc"]["balance"] })
                organization.dc_balance_nonce - 1 == event["data"]["dc"]["nonce"] ->
                  {:ok, updated_org} = Organizations.update_organization(organization, %{ "dc_balance" => organization.dc_balance - created_event.data["dc"]["used"] })
                  ConsoleWeb.DataCreditController.broadcast_router_refill_dc_balance(updated_org)

                  {:ok, updated_org}
                true ->
                  {:error, "DC balance nonce inconsistent between router: #{event["data"]["dc"]["nonce"]} and console: #{organization.dc_balance_nonce}"}
              end
            else
              {:ok, organization}
            end
          end)
          |> Repo.transaction()

        with {:ok, %{ event: event, organization: organization }} <- result do
          publish_created_event(event, event_device)

          if event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] or event.category == "join_request" do
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
              check_event_integration_alerts(event)
            "downlink" ->
              if event.sub_category == "downlink_dropped" do
                details = %{ device_id: event_device.id, device_name: event_device.name }
                device_labels = Enum.map(event_device.labels, fn l -> l.id end)
                limit = %{ time_buffer: Timex.shift(Timex.now, hours: -1) }
                AlertEvents.notify_alert_event(event_device.id, "device", "downlink_unsuccessful", details, device_labels, limit)
              end
            "misc" ->
              check_misc_integration_error_alert(event)
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

    label_ids = Labels.get_device_labels(device.id) |> Enum.map(fn dl -> dl.label_id end)
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

  def check_org_dc_balance(organization, prev_dc_balance) do
    if organization.automatic_charge_amount == nil do
      cond do
        prev_dc_balance > 500_000 and organization.dc_balance <= 500_000 and organization.dc_balance > 499990 ->
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

                    last_dc_purchase = DcPurchases.get_last_nonrecurring_dc_purchase(organization)
                    last_dc_purchaser = if not is_nil(last_dc_purchase) do Organizations.get_membership(last_dc_purchase.user_id, organization) else nil end

                    receipt_email = case last_dc_purchaser do
                      nil ->
                        admin = List.first(Organizations.get_administrators(organization))
                        case admin do
                          nil -> ""
                          _ -> admin.email
                        end
                      _ ->
                        last_dc_purchaser.email
                    end

                    attrs = %{
                      "dc_purchased" => payment_intent["amount"] * 1000,
                      "cost" => payment_intent["amount"],
                      "card_type" => card["card"]["brand"],
                      "last_4" => card["card"]["last4"],
                      "user_id" => "Recurring Charge",
                      "organization_id" => organization.id,
                      "payment_id" => payment_intent["id"],
                      "receipt_email" => receipt_email,
                      "description" => "Data Credits"
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

  def update_devices_in_xor_filter(conn, %{"added" => added_device_ids, "removed" => _removed_device_ids}) do
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

  def check_event_integration_alerts(event) do
    if event.data["integration"] != nil and event.data["integration"]["id"] != "no_channel" do
      event_integration = Channels.get_channel(event.data["integration"]["id"])

      if event_integration != nil do
        reported_at_naive =
          case Map.get(event, :reported_at_naive, nil) do
            nil ->
              event.reported_at
              |> DateTime.from_unix!(:millisecond)
              |> DateTime.to_naive()
            time -> time
          end

        if event_integration.time_first_uplink == nil do
          Channels.update_channel(event_integration, %{ time_first_uplink: reported_at_naive })
          { _, time } = Timex.format(reported_at_naive, "%H:%M:%S UTC", :strftime)
          details = %{ time: time, channel_name: event_integration.name, channel_id: event_integration.id }
          AlertEvents.notify_alert_event(event_integration.id, "integration", "integration_receives_first_event", details)
        end

        if event.data["integration"]["status"] != "success" do
          { _, time } = Timex.format(reported_at_naive, "%H:%M:%S UTC", :strftime)
          device = Devices.get_device!(event.device_id)
          details = %{
            channel_name: event_integration.name,
            channel_id: event_integration.id,
            time: time,
            device_name: device.name,
            device_id: device.id
          }
          limit = %{ time_buffer: Timex.shift(Timex.now, hours: -1) }
          AlertEvents.notify_alert_event(event_integration.id, "integration", "integration_stops_working", details, nil, limit)
          Channels.update_channel(event_integration, %{ last_errored: true })
        else
          if event_integration.last_errored do
            Channels.update_channel(event_integration, %{ last_errored: false })
          end
        end
      end
    end
  end

  def check_misc_integration_error_alert(event) do
    if event.sub_category == "misc_integration_error" do
      event_integration = Channels.get_channel(event.data["integration"]["id"])
      case event_integration do
        nil -> nil
        _ ->
          reported_at_naive =
            case Map.get(event, :reported_at_naive, nil) do
              nil ->
                event.reported_at
                |> DateTime.from_unix!(:millisecond)
                |> DateTime.to_naive()
              time -> time
            end

          { _, time } = Timex.format(reported_at_naive, "%H:%M:%S UTC", :strftime)
          device = Devices.get_device!(event.device_id)
          details = %{
            channel_name: event_integration.name,
            channel_id: event_integration.id,
            time: time,
            device_name: device.name,
            device_id: device.id
          }
          limit = %{ time_buffer: Timex.shift(Timex.now, hours: -1) }
          AlertEvents.notify_alert_event(event_integration.id, "integration", "integration_stops_working", details, nil, limit)
          Channels.update_channel(event_integration, %{ last_errored: true })
      end
    end
  end
end
