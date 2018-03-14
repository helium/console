defmodule ConsoleWeb.ChannelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.ChannelView

  def render("index.json", %{channels: channels}) do
    %{data: render_many(channels, ChannelView, "channel.json")}
  end

  def render("show.json", %{channel: channel}) do
    %{data: render_one(channel, ChannelView, "channel.json")}
  end

  def render("channel.json", %{channel: channel}) do
    %{id: channel.id,
      name: channel.name,
      type: channel.type,
      active: channel.active,
      credentials: channel.credentials}
  end
end
