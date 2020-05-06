defmodule ConsoleWeb.V1.DownlinkController do
  use ConsoleWeb, :controller
  alias Console.Repo
  alias Console.Devices
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
      nil -> {:error, :not_found, "Integration not found"}
      _ ->
        if channel.type == "http" and token == Map.get(channel, :downlink_token) do
          channel = channel |> Repo.preload([labels: [:devices]])
          devices = channel.labels |> Enum.map(fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)

          cond do
            length(devices) == 0 ->
              {:error, :not_found, "Devices not found on integration"}
            device_id != nil and !Enum.member?(devices, device_id) ->
              {:error, :not_found, "Device not found on integration"}
            device_id != nil and Enum.member?(devices, device_id) ->
              ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:devices", %{ "devices" => [device_id], "payload" => conn.body_params })
              
              conn
              |> send_resp(:ok, "Downlink scheduled")
            device_id == nil ->
              ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:devices", %{ "devices" => devices, "payload" => conn.body_params })

              conn
              |> send_resp(:ok, "Downlink scheduled")
          end
        else
          {:error, :not_found, "Integration not found"}
        end
    end
  end
end
