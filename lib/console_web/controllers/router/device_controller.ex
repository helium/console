defmodule ConsoleWeb.Router.DeviceController do
  use ConsoleWeb, :controller
  import ConsoleWeb.AuthErrorHandler

  alias Console.Devices
  alias Console.Devices.Device

  def show(conn, %{"id" => id_or_mac}) do
    if String.length(id_or_mac) == 36 do
      id = id_or_mac
      with %Device{} = device = Devices.get_device(id) do
        conn |> show_device(device)
      end
    else
      mac = id_or_mac
      with %Device{} = device = Devices.get_by_mac(mac) do
        conn |> show_device(device)
      end
    end
  end

  defp show_device(conn, device) do
    device = device |> Devices.fetch_assoc([:channels])

    conn
    |> render("show.json", device: device)
  end
end
