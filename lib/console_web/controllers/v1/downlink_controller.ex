defmodule ConsoleWeb.V1.DownlinkController do
  use ConsoleWeb, :controller
  alias Console.Channels
  alias Console.Labels
  alias Console.Flows
  alias Console.CommunityChannels

  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  @supported_regions ["US915", "AU915", "EU868", "CN470", "AS923_1", "AS923_2", "AS923_3", "AS923_4"]

  def down(conn, %{ "channel_id" => channel_id, "downlink_token" => token, "device_id" => device_id }) do
    cond do
      Ecto.UUID.dump(channel_id) == :error ->
        {:error, :bad_request, "channel_id param must be a valid UUID"}
      Ecto.UUID.dump(device_id) == :error ->
        {:error, :bad_request, "device_id param must be a valid UUID"}
      true ->
        down(conn, channel_id, token, device_id)
    end
  end

  def down(conn, %{ "channel_id" => channel_id, "downlink_token" => token }) do
    with {:ok, _id} <- Ecto.UUID.dump(channel_id) do
      down(conn, channel_id, token, nil)
    else
      :error ->
        {:error, :bad_request, "channel_id param must be a valid UUID"}
    end
  end

  defp down(conn, channel_id, token, device_id) do
    channel = Channels.get_channel(channel_id)

    case channel do
      nil -> {:error, :bad_request, "Integration not found"}
      _ ->
        channel = CommunityChannels.inject_credentials(channel, true)
        
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
            not is_nil(Map.get(conn.body_params, "region")) and Map.get(conn.body_params, "region") not in @supported_regions ->
              {:error, :bad_request, "Invalid or unsupported region"}
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
