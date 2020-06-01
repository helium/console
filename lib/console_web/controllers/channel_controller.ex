defmodule ConsoleWeb.ChannelController do
  use ConsoleWeb, :controller

  alias Console.Channels
  alias Console.Labels
  alias Console.Channels.Channel
  alias Console.Organizations

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"channel" => channel_params, "labels" => labels}) do
    current_organization = conn.assigns.current_organization
    user = conn.assigns.current_user
    channel_params = Map.merge(channel_params, %{"organization_id" => current_organization.id})

    with {:ok, %Channel{} = channel} <- Channels.create_channel(current_organization, channel_params) do
      case labels["labelsApplied"] do
        nil -> nil
        applied_labels ->
          label_ids = applied_labels
            |> Enum.map(fn label ->
              label["id"]
            end)
          Labels.add_labels_to_channel(label_ids, channel, current_organization)
      end

      case labels["newLabels"] do
        nil -> nil
        new_labels ->
          Labels.create_labels_add_channel(channel, new_labels, current_organization, user)
      end
      broadcast(channel)

      conn
      |> put_status(:created)
      |> render("show.json", channel: channel)
    end
  end

  def update(conn, %{"id" => id, "channel" => channel_params}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id)

    with {:ok, %Channel{} = channel} <- Channels.update_channel(channel, current_organization, channel_params) do
      broadcast(channel, channel.id)

      conn
      |> put_resp_header("message", "#{channel.name} updated successfully")
      |> render("show.json", channel: channel)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    channel = Channels.get_channel!(current_organization, id) |> Channels.fetch_assoc([:labels])

    with {:ok, %Channel{} = channel} <- Channels.delete_channel(channel) do
      broadcast(channel)
      msg =
        case length(channel.labels) do
          0 -> "The Integration #{channel.name} has been deleted"
          _ ->
            labels = Enum.reduce(channel.labels, "", fn (l, acc) -> acc = acc <> l.name <> ", " end)
            "The devices with label #{labels}are no longer connected to Integration #{channel.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", channel: channel)
    end
  end

  def broadcast(%Channel{} = channel) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, channel, channel_added: "#{channel.organization_id}/channel_added")
  end

  def broadcast(%Channel{} = channel, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, channel, channel_updated: "#{channel.organization_id}/#{id}/channel_updated")
  end
end
