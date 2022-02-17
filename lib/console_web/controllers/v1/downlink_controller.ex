defmodule ConsoleWeb.V1.DownlinkController do
  use ConsoleWeb, :controller
  alias Console.Channels
  alias Console.Labels
  alias Console.Flows

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
          flows = Flows.get_flows_with_channel_id(channel.organization_id, channel.id)
          labels_attached = Enum.filter(flows, fn f -> f.label_id != nil end) |> Enum.map(fn f -> f.label_id end)
          devices_attached = Enum.filter(flows, fn f -> f.device_id != nil end) |> Enum.map(fn f -> f.device_id end)

          label_devices_attached =
            Labels.get_labels_and_attached_devices(labels_attached)
            |> Enum.map(fn l -> l.devices end)
            |> List.flatten()
            |> Enum.map(fn d -> d.id end)

          devices = devices_attached ++ label_devices_attached |> Enum.uniq()

          cond do
            length(devices) == 0 ->
              {:error, :bad_request, "Devices not found on integration"}
            device_id != nil and !Enum.member?(devices, device_id) ->
              {:error, :bad_request, "Device not found on integration"}
            device_id != nil and Enum.member?(devices, device_id) ->
              case Map.get(conn.body_params, :aspect) do # body_params errors out with %Plug.Conn.Unfetched{aspect: :body_params}
                nil ->
                  ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:devices", %{ "channel_name" => channel.name, "devices" => [device_id], "payload" => conn.body_params })
                  conn
                  |> send_resp(:ok, "Downlink scheduled")
                _ ->
                  {:error, :bad_request, "Invalid Content-Type header or payload"}
              end
            device_id == nil ->
              case Map.get(conn.body_params, :aspect) do # body_params errors out with %Plug.Conn.Unfetched{aspect: :body_params}
                nil ->
                  ConsoleWeb.Endpoint.broadcast("device:all", "device:all:downlink:devices", %{ "channel_name" => channel.name, "devices" => devices, "payload" => conn.body_params })
                  conn
                  |> send_resp(:ok, "Downlink scheduled")
                _ ->
                  {:error, :bad_request, "Invalid Content-Type header or payload"}
              end
          end
        else
          {:error, :bad_request, "Downlink token invalid for integration"}
        end
    end
  end
end
