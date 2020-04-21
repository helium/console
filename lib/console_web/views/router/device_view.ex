defmodule ConsoleWeb.Router.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.DeviceView
  alias ConsoleWeb.Router.ChannelView
  alias ConsoleWeb.Router.LabelView

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
      dev_eui: device.dev_eui,
      app_eui: device.app_eui,
      app_key: device.app_key,
      oui: device.oui,
      organization_id: device.organization_id
    }
    |> ChannelView.append_channels(device.channels)
    |> LabelView.append_labels(device.labels)
  end
end
