defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

  alias Console.Channels
  alias Console.Channels.Channel
  alias Console.Organizations

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization
      |> Organizations.fetch_assoc([:channels])

    render(conn, "index.json", channels: current_organization.channels)
  end

  def create(conn, %{"channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
      broadcast(channel)

      conn
      |> put_status(:created)
      |> render("show.json", channel: channel)
    end
  end

  def show(conn, %{"id" => id}) do
    channel = Channels.get_channel!(id)

    render(conn, "show.json", channel: channel)
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(id)

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, current_organization, channel_params) do
      broadcast(channel)

      conn
      |> put_resp_header("message", "#{channel.name} updated successfully")
      |> render("show.json", channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    channel = Channels.get_channel!(id)

    with {:ok, %Channel{} = channel} <- Channels.delete_channel(channel) do
      broadcast(channel)

      conn
      |> put_resp_header("message", "#{channel.name} deleted successfully")
      |> render("show.json", channel: channel)
    end
  end

  defp broadcast(%Channel{} = channel) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, channel, channel_updated: "#{channel.organization_id}/channel_updated")
  end
end
