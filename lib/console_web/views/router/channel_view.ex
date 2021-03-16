defmodule ConsoleWeb.Router.ChannelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.ChannelView
  alias ConsoleWeb.Router.FunctionView

  def render("index.json", %{channels: channels}) do
    render_many(channels, ChannelView, "channel.json")
  end

  def render("show.json", %{channel: channel}) do
    render_one(channel, ChannelView, "channel.json")
  end

  def render("channel.json", %{channel: channel}) do
    channel_json =
      %{
        id: channel.id,
        name: channel.name,
        type: channel.type,
        credentials: channel.credentials,
        active: channel.active,
        organization_id: channel.organization_id,
        downlink_token: channel.downlink_token,
        payload_template: channel.payload_template,
      }
  end
end
