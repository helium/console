defmodule ConsoleWeb.V1.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.DeviceView
  alias ConsoleWeb.V1.LabelView
  alias ConsoleWeb.V1.EventView

  def render("index.json", %{devices: devices}) do
    render_many(devices, DeviceView, "device.json")
  end

  def render("show.json", %{device: device}) do
    render_one(device, DeviceView, "device.json")
  end

  def render("device.json", %{device: device}) do
    device_attrs = %{
      id: device.id,
      name: device.name,
      dev_eui: device.dev_eui,
      app_eui: device.app_eui,
      app_key: device.app_key,
      oui: device.oui,
      organization_id: device.organization_id,
      adr_allowed: device.adr_allowed,
      cf_list_enabled: device.cf_list_enabled,
      in_xor_filter: device.in_xor_filter,
      dc_usage: device.dc_usage,
      total_packets: device.total_packets,
      last_connected: device.last_connected,
      config_profile_id: device.config_profile_id
    }

    if Ecto.assoc_loaded?(device.labels) do
      device_attrs |> LabelView.append_labels(device.labels)
    else
      device_attrs
    end
  end

  def render("show_events.json", %{device: device}) do
    EventView.show_events(device.events)
  end
end
