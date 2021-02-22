defmodule ConsoleWeb.DownlinkController do
  use ConsoleWeb, :controller

  alias Console.Devices

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def clear_downlink_queue(conn, %{ "label_id" => label_id }) do
    devices = Devices.get_devices_for_label(label_id)
    if length(devices) > 0 do
      clear_downlink_queue(Enum.map(devices, fn d -> d.id end))
      conn
      |> put_resp_header("message", "Downlink queue cleared")
      |> send_resp(:no_content, "")
    else
      {:error, :bad_request, "Label has no devices"}
    end
  end

  def clear_downlink_queue(conn, %{ "device_id" => device_id }) do
    if Devices.get_device(conn.assigns.current_organization, device_id) != nil do
      clear_downlink_queue([device_id])
      conn
      |> put_resp_header("message", "Downlink queue successfully cleared")
      |> send_resp(:no_content, "")
    else
      {:error, :bad_request, "Device ID does not exist"}
    end
  end

  defp clear_downlink_queue(devices) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:clear_downlink_queue:devices", %{ "devices" => devices })
  end
end