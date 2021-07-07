defmodule ConsoleWeb.V1.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.DeviceView
  alias ConsoleWeb.V1.LabelView

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
      cf_list_enabled: device.cf_list_enabled
    }

    if Ecto.assoc_loaded?(device.labels) do
      device_attrs |> LabelView.append_labels(device.labels)
    else
      device_attrs
    end
  end
end
