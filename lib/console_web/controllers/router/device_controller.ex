defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  import ConsoleWeb.AuthErrorHandler

  alias Console.Devices
  alias Console.Organizations
  alias Console.Organizations
  alias Console.Devices.Device
  alias Console.Channels

  def show(conn, %{"dev_eui" => dev_eui, "app_eui" => app_eui}) do
    devices = Devices.get_by_dev_eui_app_eui(dev_eui, app_eui)
    render(conn, "index.json", devices: devices)
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

  defp show_device(conn, device) do
    device = device |> Devices.fetch_assoc([:labels])
    channels = Ecto.assoc(device.labels, :channels) |> Repo.all() |> Enum.uniq()
    
    conn
    |> render("show.json", device: Map.put(device, :channels, channels))
  end
end
