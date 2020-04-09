defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query
  import ConsoleWeb.AuthErrorHandler

  alias Console.Labels
  alias Console.Devices
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
    device = Devices.get_device!(id) |> Repo.preload([:labels])
    device =
      if length(device.labels) > 0 do
        Map.put(device, :channels, Ecto.assoc(device.labels, :channels) |> Repo.all() |> Enum.uniq())
      else
        Map.put(device, :channels, [])
      end

    render(conn, "show.json", device: device)
  end

  def add_device_event(conn, %{"device_id" => device_id} = event) do
    case Devices.get_device(device_id) do
      nil ->
        conn
        |> send_resp(404, "")
      %Device{} = device ->
        case Events.create_event(event) do
          {:ok, event} ->
            Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, event_added: "devices/#{device_id}/event")
            Devices.update_device(device, %{
              "last_connected" => event.reported_at_naive,
              "frame_up" => event.frame_up,
              "frame_down" => event.frame_down,
              "total_packets" => device.total_packets + 1,
            })

            label_ids = Labels.get_labels_of_device(device) |> Enum.map(fn dl -> dl.label_id end)
            Enum.each(label_ids, fn id ->
              Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, label_debug_event_added: "labels/#{id}/event")
            end)
        end

        conn
        |> send_resp(200, "")
    end
  end
end
