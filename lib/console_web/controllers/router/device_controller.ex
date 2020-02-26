defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query
  import ConsoleWeb.AuthErrorHandler

  alias Console.Devices
  alias Console.Devices.Device
  alias Console.Organizations
  alias Console.Organizations
  alias Console.Devices.Device
  alias Console.Channels

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
    device = Devices.get_device!(id)
    if length(device.labels) > 0 do
      Map.put(device, :channels, Ecto.assoc(device.labels, :channels) |> Repo.all() |> Enum.uniq())
    else
      Map.put(device, :channels, [])
    end

    render(conn, "show.json", device: device)
  end

  def show_event(conn, %{"device_id" => device_id} = event) do
    case Devices.get_device(device_id) do
      nil ->
        conn
        |> send_resp(404, "")
      %Device{} ->
        event = for {key, val} <- event, into: %{}, do: {String.to_atom(key), val}
        Absinthe.Subscription.publish(ConsoleWeb.Endpoint, event, event_added: "devices/#{device_id}")
        conn
        |> send_resp(200, "")
    end
  end
end
