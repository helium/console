defmodule ConsoleWeb.DownlinkController do
  use ConsoleWeb, :controller

  alias Console.Devices
  alias Console.Labels

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def fetch_downlink_queue(conn, %{ "id" => id, "type" => type }) do
    current_organization = conn.assigns.current_organization
    case type do
      "device" ->
        device = Devices.get_device!(current_organization, id)
        get_device_downlink_queue(device)
      "label" ->
        label = Labels.get_label!(current_organization, id)
        get_label_downlink_queue(label)
    end

    conn
    |> send_resp(:no_content, "")
  end

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

  defp get_device_downlink_queue(device) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:fetch_queue", %{ "device" => device.id })
  end

  defp get_label_downlink_queue(label) do
    assoc_device_ids = label |> Labels.fetch_assoc([:devices]) |> Map.get(:devices) |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:fetch_queue", %{ "label" => label.id, "devices" => assoc_device_ids })
    end
  end
end
