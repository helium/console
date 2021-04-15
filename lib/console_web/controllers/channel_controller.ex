defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

  alias Console.Channels
  alias Console.Channels.Channel

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do

      conn
      |> put_status(:created)
      |> render("show.json", channel: channel)
    end
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id)

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, current_organization, channel_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:channel_show", "graphql:channel_show:#{channel.id}:channel_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:resources_update", "graphql:resources_update:#{current_organization.id}:organization_resources_update", %{})

      conn
      |> put_resp_header("message", "Integration #{channel.name} updated successfully")
      |> render("show.json", channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id)

    with {:ok, %Channel{} = channel} <- Channels.delete_channel(channel) do
      ConsoleWeb.Endpoint.broadcast("graphql:channels_index_table", "graphql:channels_index_table:#{current_organization.id}:channel_list_update", %{})

      conn
      |> put_resp_header("message", "The Integration #{channel.name} has been deleted")
      |> render("show.json", channel: channel)
    end
  end

  def get_ubidots_url(conn, %{"token" => token, "name" => name}) do
    headers = [{"Content-Type", "application/json"}, {"x-auth-token", token}]
    body = Jason.encode!(%{
      name: name,
      description: "Plugin created using Ubidots APIv2",
      settings: %{
        device_type_name: "Helium",
        helium_labels_as: "tags",
        token: token
      }
    })
    response = HTTPoison.post "https://industrial.api.ubidots.com/api/v2.0/plugin_types/~helium/plugins/", body, headers
    case response do
      {:ok, %{ status_code: 201, body: body }} ->
        conn
        |> put_resp_header("message", "Received Ubidots plugin webhook URL successfully")
        |> send_resp(:ok, body)
      _ ->
        errors = %{ "errors" => %{ "error" => "Failed to create Ubidots plugin with provided token" }}

        conn
        |> send_resp(502, Jason.encode!(errors))
    end
  end

  defp broadcast_router_update_devices(%Channel{} = channel) do
    assoc_labels = channel |> Channels.fetch_assoc([labels: :devices]) |> Map.get(:labels)
    assoc_device_ids = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end

  defp broadcast_router_update_devices(assoc_labels) do
    assoc_device_ids = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end
end
