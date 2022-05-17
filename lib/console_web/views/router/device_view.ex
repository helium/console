defmodule ConsoleWeb.Router.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.DeviceView
  alias ConsoleWeb.Router.ChannelView
  alias ConsoleWeb.Router.LabelView

  def render("index.json", %{devices: devices}) do
    render_many(devices, DeviceView, "device_short.json")
  end

  def render("devices.json", %{devices: devices}) do
    render_many(devices, DeviceView, "device_short.json")
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
      organization_id: device.organization_id,
      active: device.active,
      adr_allowed: device.adr_allowed,
      multi_buy: device.multi_buy,
      cf_list_enabled: device.cf_list_enabled,
      rx_delay: device.rx_delay,
      preferred_hotspots: device.preferred_hotspots,
      ecc_key_pair: :base64.encode(device.ecc_key_pair),
    }
    |> ChannelView.append_channels(device.channels)
    |> LabelView.append_labels(device.labels)
  end

  def render("device_short.json", %{device: device}) do
    %{
      id: device.id,
      name: device.name,
      dev_eui: device.dev_eui,
      app_eui: device.app_eui,
      app_key: device.app_key,
      oui: device.oui,
      organization_id: device.organization_id,
      active: device.active,
    }
  end
end
