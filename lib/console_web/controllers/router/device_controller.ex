defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  import ConsoleWeb.AuthErrorHandler

  alias Console.Devices
  alias Console.Devices.Device
  alias Console.Channels

  def show(conn, %{"id" => id, "oui" => oui}) do
    with %Device{} = device <- Devices.get_by_seq_id(id, oui) do
      conn |> show_device(device)
    end
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
    device = device |> Devices.fetch_assoc([:channels])
    device =
      case device.channels do
        [] ->
          default_channel = Channels.get_default_channel()
          if default_channel != nil do
            Map.put(device, :channels, [default_channel])
          else
            device
          end
        _ -> device
      end
    conn
    |> render("show.json", device: device)
  end
end
