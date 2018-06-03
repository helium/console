defmodule ConsoleWeb.ChannelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.ChannelView
  alias ConsoleWeb.EventView
  alias ConsoleWeb.GroupView

  def render("index.json", %{channels: channels}) do
    render_many(channels, ChannelView, "channel.json")
  end

  def render("show.json", %{channel: channel}) do
    render_one(channel, ChannelView, "channel.json")
  end

  def render("channel.json", %{channel: channel}) do
    %{
      id: channel.id,
      name: channel.name,
      type: channel.type,
      type_name: channel.type_name,
      credentials: channel.credentials,
      active: channel.active,
      team_id: channel.team_id
    }
    |> append_events(channel.events)
    |> GroupView.append_group_names(channel.groups)
  end

  # TODO: could I import this from events view? used across 3 views
  defp append_events(json, events) do
    if Ecto.assoc_loaded?(events) do
      events_json = render_many(events, EventView, "event.json")
      Map.put(json, :events, events_json)
    else
      json
    end
  end
end
