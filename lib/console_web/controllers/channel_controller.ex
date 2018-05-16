defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

  alias Console.Channels
  alias Console.Channels.Channel
  alias Console.AuditTrails

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_team =
      conn.assigns.current_team
      |> Console.Teams.fetch_assoc([channels: :groups])

    render(conn, "index.json", channels: current_team.channels)
  end

  def create(conn, %{"channel" => channel_params}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    channel_params = Map.merge(channel_params, %{"team_id" => current_team.id})

    with {:ok, %Channel{} = channel} <- Channels.create_channel(channel_params) do
      broadcast(channel, "new")
      AuditTrails.create_audit_trail("channel", "create", current_user, current_team, "channels", channel)

      conn
      |> put_status(:created)
      |> put_resp_header("location", channel_path(conn, :show, channel))
      |> render("show.json", channel: channel)
    end
  end

  def show(conn, %{"id" => id}) do
    channel =
      Channels.get_channel!(id)
      |> Channels.fetch_assoc([:events, :groups])

    render(conn, "show.json", channel: channel)
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    channel = Channels.get_channel!(id)

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, channel_params) do
      AuditTrails.create_audit_trail("channel", "update", current_user, current_team, "channels", channel)

      conn
      |> put_resp_header("message", "#{channel.name} updated successfully")
      |> render("show.json", channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team
    channel = Channels.get_channel!(id)
    with {:ok, %Channel{} = channel} <- Channels.delete_channel(channel) do
      broadcast(channel, "delete")
      AuditTrails.create_audit_trail("channel", "delete", current_user, current_team, "channels", channel)

      send_resp(conn, :no_content, "")
    end
  end

  defp broadcast(%Channel{} = channel, action) do
    channel = Channels.fetch_assoc(channel, [:team])
    body = ConsoleWeb.ChannelView.render("show.json", channel: channel)
    ConsoleWeb.Endpoint.broadcast("channel:#{channel.team.id}", action, body)
  end
end
