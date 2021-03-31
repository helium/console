defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo

  alias Console.Labels
  alias Console.Devices
  alias Console.Channels
  alias Console.Organizations
  alias Console.Devices.Device
  alias Console.DeviceStats
  alias Console.Events
  alias Console.DcPurchases
  alias Console.DcPurchases.DcPurchase
  alias Console.Email
  alias Console.Mailer
  alias Console.LabelNotificationEvents

  @stripe_api_url "https://api.stripe.com"
  @headers [
    {"Authorization", "Bearer #{Application.get_env(:console, :stripe_secret_key)}"},
    {"Content-Type", "application/x-www-form-urlencoded"}
  ]

  def index(conn, _) do
    devices = Devices.list_devices()

    render(conn, "index.json", devices: devices)
  end

  def show(conn, %{"id" => _, "dev_eui" => dev_eui, "app_eui" => app_eui}) do
    devices = Devices.get_by_dev_eui_app_eui(dev_eui, app_eui)
    devices = Enum.map(devices, fn d ->
      if length(d.labels) > 0 do
        Map.put(d, :channels, Ecto.assoc(d.labels, :channels) |> Repo.all() |> Enum.uniq())
      else
        Map.put(d, :channels, [])
      end
    end)

    render(conn, "devices.json", devices: devices)
  end

  def show(conn, %{"id" => id}) do
    device = Devices.get_device!(id) |> Repo.preload([labels: [:channels, :function]])
    device =
      if length(device.labels) > 0 do
        channels_with_functions_and_channels =
          device.labels
          |> Enum.filter(fn l -> l.function != nil && l.function.active == true && length(l.channels) > 0 end)
          |> Enum.map(fn l ->
            Enum.map(l.channels, fn c -> Map.put(c, :function, l.function) end)
          end)
          |> List.flatten()

        channels_with_functions_no_channels =
          device.labels
          |> Enum.filter(fn l -> l.function != nil && l.function.active == true && length(l.channels) == 0 end)
          |> Enum.map(fn l ->
            %{
              function: l.function,
              id: "no_channel",
              name: "Internal Integration",
              type: "console",
              credentials: %{},
              active: false,
              organization_id: "no_organization_id",
              downlink_token: "no_downlink_token",
              payload_template: nil,
            }
          end)
          |> List.flatten()

        channels_without_functions =
          device.labels
          |> Enum.filter(fn l -> l.function == nil || l.function.active == false end)
          |> Enum.map(fn l -> l.channels end)
          |> List.flatten()
          |> Enum.uniq()
          |> Enum.map(fn c -> Map.put(c, :function, nil) end)

        adr_allowed = device.labels |> Enum.map(fn l -> l.adr_allowed end) |> Enum.find(fn s -> s == true end)
        device =
          case adr_allowed do
            true -> Map.put(device, :adr_allowed, true)
            _ -> device
          end

        multi_buy_value = device.labels |> Enum.map(fn l -> l.multi_buy end) |> Enum.max
        case multi_buy_value do
          0 ->
            Map.put(device, :channels, channels_with_functions_and_channels ++ channels_with_functions_no_channels ++ channels_without_functions)
          10 ->
            Map.put(device, :channels, channels_with_functions_and_channels ++ channels_with_functions_no_channels ++ channels_without_functions)
            |> Map.put(:multi_buy, 9999) #9999 is the value for router to indicate all available packets
          _ ->
            Map.put(device, :channels, channels_with_functions_and_channels ++ channels_with_functions_no_channels ++ channels_without_functions)
            |> Map.put(:multi_buy, multi_buy_value)
        end
      else
        Map.put(device, :channels, [])
      end

    render(conn, "show.json", device: device)
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
            Events.create_event(Map.put(event, "organization_id", organization.id))
          end)
          |> Ecto.Multi.run(:device, fn _repo, %{ event: event } ->
            locked_device = Devices.get_device_and_lock_for_add_device_event(device.id)

            dc_used =
              case event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] do
                true -> event.data["dc"]["used"]
                false -> 0
              end
            packet_count = if dc_used == 0, do: 0, else: 1

            device_updates = %{
              "last_connected" => event.reported_at_naive,
              "total_packets" => locked_device.total_packets + packet_count,
              "dc_usage" => locked_device.dc_usage + dc_used,
            }

            device_updates = cond do
              is_integer(event.frame_up) -> device_updates |> Map.put("frame_up", event.frame_up)
              is_integer(event.frame_down) -> device_updates |> Map.put("frame_down", event.frame_down)
              true -> device_updates
            end

            Devices.update_device(locked_device, device_updates, "router")
          end)
          |> Ecto.Multi.run(:device_stat, fn _repo, %{ event: event, device: device } ->
            if event.sub_category in ["uplink_confirmed", "uplink_unconfirmed"] do
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
          |> Ecto.Multi.run(:organization, fn _repo, %{ device: _device, event: created_event } ->
            if event["sub_category"] in ["uplink_confirmed", "uplink_unconfirmed"] do
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
            LabelNotificationEvents.notify_label_event(device_labels, "device_join_otaa_first_time", details)
          end

          case event.category do
            "uplink" ->
              if event.data["integration"] != nil and event.data["integration"]["id"] != "no_channel" do
                event_integration = Channels.get_channel(event.data["integration"]["id"]) |> Repo.preload([:labels])
                labels = Enum.map(event_integration.labels, fn l -> l.id end)

                if event_integration.time_first_uplink == nil do
                  Channels.update_channel(event_integration, organization, %{ time_first_uplink: event.reported_at_naive })
                  { _, time } = Timex.format(event.reported_at_naive, "%H:%M:%S UTC", :strftime)
                  details = %{ time: time, channel_name: event_integration.name, channel_id: event_integration.id }
                  LabelNotificationEvents.notify_label_event(labels, "integration_receives_first_event", details)
                end

                if event.data["integration"]["status"] != "success" do
                  { _, time } = Timex.format(event.reported_at_naive, "%H:%M:%S UTC", :strftime)
                  details = %{
                    channel_name: event_integration.name,
                    channel_id: event_integration.id,
                    time: time
                  }
                  limit = %{ integration_id: event_integration.id, time_buffer: Timex.shift(Timex.now, hours: -1) }
                  LabelNotificationEvents.notify_label_event(labels, "integration_stops_working", details, limit)
                end
              end
            "downlink" ->
              if event.sub_category == "downlink_dropped" do
                details = %{ device_id: event_device.id, device_name: event_device.name }
                device_labels = Enum.map(event_device.labels, fn l -> l.id end)
                limit = %{ device_id: event_device.id, time_buffer: Timex.shift(Timex.now, hours: -1) }
                LabelNotificationEvents.notify_label_event(device_labels, "downlink_unsuccessful", details, limit)
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
    ConsoleWeb.Endpoint.broadcast("graphql:device_show_debug", "graphql:device_show_debug:#{device.id}:get_event", event_to_publish)

    label_ids = Labels.get_labels_of_device(device) |> Enum.map(fn dl -> dl.label_id end)
    Enum.each(label_ids, fn id ->
      ConsoleWeb.Endpoint.broadcast("graphql:label_show_debug", "graphql:label_show_debug:#{id}:get_event", event_to_publish)
    end)
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
end
