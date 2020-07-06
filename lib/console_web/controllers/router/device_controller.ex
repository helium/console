defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query
  import ConsoleWeb.AuthErrorHandler

  alias Console.Labels
  alias Console.Devices
  alias Console.Organizations
  alias Console.Devices.Device
  alias Console.Events

  def show(conn, %{"id" => _, "dev_eui" => dev_eui, "app_eui" => app_eui}) do
    devices = Devices.get_by_dev_eui_app_eui(dev_eui, app_eui)
    devices = Enum.map(devices, fn d ->
      if length(d.labels) > 0 do
        Map.put(d, :channels, Ecto.assoc(d.labels, :channels) |> Repo.all() |> Enum.uniq())
      else
        Map.put(d, :channels, [])
      end
    end)

    render(conn, "index.json", devices: devices)
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
              id: "no_integration_id",
              name: "Console Debug Integration",
              type: "console",
              credentials: %{},
              active: false,
              organization_id: "no_organization_id",
              downlink_token: "no_downlink_token"
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

        Map.put(device, :channels, channels_with_functions_and_channels ++ channels_with_functions_no_channels ++ channels_without_functions)
      else
        Map.put(device, :channels, [])
      end

    render(conn, "show.json", device: device)
  end

  def add_device_event(conn, %{"device_id" => device_id} = event) do
    payload = event["payload"]
    channels_with_debug =
      event["channels"]
      |> Enum.map(fn c ->
        case c["debug"] do
          nil -> c
          value -> Map.put(c, "debug", Jason.encode!(value))
        end
      end)
      |> Enum.map(fn c ->
        c |> Map.new(fn {k, v} -> {String.to_atom(k), v} end)
      end)

    channels_without_debug =
      event["channels"]
      |> Enum.map(fn c ->
        Map.drop(c, ["debug"])
      end)

    event = Map.put(event, "channels", channels_without_debug)

    case Devices.get_device(device_id) do
      nil ->
        conn
        |> send_resp(404, "")
      %Device{} = device ->
        case Events.create_event(event) do
          {:ok, event} ->
            event =
              case payload do
                nil ->
                  Map.merge(event, %{ device_name: device.name })
                _ ->
                  Map.merge(event, %{ device_name: device.name, payload: payload, channels: channels_with_debug })
              end

            Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, event_added: "devices/#{device_id}/event")
            Devices.update_device(device, %{
              "last_connected" => event.reported_at_naive,
              "frame_up" => event.frame_up,
              "frame_down" => event.frame_down,
              "total_packets" => device.total_packets + 1,
            }, "router")

            label_ids = Labels.get_labels_of_device(device) |> Enum.map(fn dl -> dl.label_id end)
            Enum.each(label_ids, fn id ->
              Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, label_debug_event_added: "labels/#{id}/event")
            end)
        end

        organization = Organizations.get_organization(device.organization_id)
        if organization.dc_balance_nonce == event["dc"]["nonce"] do
          Organizations.update_organization(organization, %{ "dc_balance" => event["dc"]["balance"] })
        end

        conn
        |> send_resp(200, "")
    end
  end
end
