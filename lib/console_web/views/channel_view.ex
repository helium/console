defmodule ConsoleWeb.ChannelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.ChannelView

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
      organization_id: channel.organization_id
    }
  end
end
