defmodule ConsoleWeb.V1.ChannelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.ChannelView
  alias ConsoleWeb.V1.LabelView
  alias ConsoleWeb.V1.DeviceView

  def render("index.json", %{channels: channels}) do
    render_many(channels, ChannelView, "channel.json")
  end

  def render("show.json", %{channel: channel}) do
    render_one(channel, ChannelView, "channel.json")
  end

  def render("channel.json", %{channel: channel}) do
    channel_attrs = %{
      id: channel.id,
      name: channel.name,
    }

    if Map.has_key?(channel, :devices) do
      labels_json = render_many(channel.labels, LabelView, "label-short.json")
      devices_json = render_many(channel.devices, DeviceView, "device-short.json")

      channel_attrs
      |> Map.put(:labels, labels_json)
      |> Map.put(:devices, devices_json)
    else
      channel_attrs
    end
  end
end
