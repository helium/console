defmodule ConsoleWeb.Router.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.DeviceView
  alias ConsoleWeb.Router.ChannelView

  def render("index.json", %{devices: devices}) do
    render_many(devices, DeviceView, "device.json")
  end

  def render("show.json", %{device: device}) do
    render_one(device, DeviceView, "device.json")
  end

  def render("device.json", %{device: device}) do
    %{
      id: device.id,
      name: device.name,
      mac: device.mac,
      key: device.key,
      dev_eui: device.dev_eui,
    }
    |> ChannelView.append_channels(device.channels)
  end
end
