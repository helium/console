defmodule ConsoleWeb.V1.DownlinkController do
  use ConsoleWeb, :controller
  alias Console.Repo
  alias Console.Devices
  alias Console.Labels
  alias Console.Channels
  import Ecto.Query

  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def down(conn, %{ "channel_id" => channel_id, "downlink_token" => token, "device_id" => device_id }) do
    down(conn, channel_id, token, device_id)
  end

  def down(conn, %{ "channel_id" => channel_id, "downlink_token" => token }) do
    down(conn, channel_id, token, nil)
  end

  defp down(conn, channel_id, token, device_id) do
    channel = Channels.get_channel(channel_id)

    case channel do
      nil -> {:error, :bad_request, "Integration not found"}
      _ ->
        if channel.type == "http" and token == Map.get(channel, :downlink_token) do
          channel = channel |> Repo.preload([labels: [:devices]])
          devices = channel.labels |> Enum.map(fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)

          cond do
            length(devices) == 0 ->
              {:error, :unprocessable_entity, "Devices not found on integration"}
            device_id != nil and !Enum.member?(devices, device_id) ->
              {:error, :unprocessable_entity, "Device not found on integration"}
            device_id != nil and Enum.member?(devices, device_id) ->
              ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:devices", %{ "channel_name" => channel.name, "devices" => [device_id], "payload" => conn.body_params })
              conn
              |> send_resp(:ok, "Downlink scheduled")
            device_id == nil ->
              ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:devices", %{ "channel_name" => channel.name, "devices" => devices, "payload" => conn.body_params })
              conn
              |> send_resp(:ok, "Downlink scheduled")
          end
        else
          {:error, :bad_request, "Integration not found"}
        end
    end
  end

  def clear_downlink_queue(conn, %{ "label_id" => label_id }) do
    devices = Devices.get_devices_for_label(label_id)
    if length(devices) > 0 do
      clear_downlink_queue(Enum.map(devices, fn d -> d.id end))
      conn
      |> send_resp(:ok, "Downlink queue cleared")
    else
      {:error, :bad_request, "Label has no devices"}
    end
  end

  def clear_downlink_queue(conn, %{ "device_id" => device_id }) do
    if Devices.get_device(conn.assigns.current_organization, device_id) != nil do
      clear_downlink_queue([device_id])
      conn
      |> send_resp(:ok, "Downlink queue cleared")
    else
      {:error, :bad_request, "Device ID does not exist"}
    end
  end

  defp clear_downlink_queue(devices) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:clear_downlink_queue:devices", %{ "devices" => devices })
  end
end
