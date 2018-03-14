defmodule ConsoleWeb.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.DeviceView

  def render("index.json", %{devices: devices}) do
    %{data: render_many(devices, DeviceView, "device.json")}
  end

  def render("show.json", %{device: device}) do
    %{data: render_one(device, DeviceView, "device.json")}
  end

  def render("device.json", %{device: device}) do
    %{id: device.id,
      name: device.name,
      mac: device.mac,
      public_key: device.public_key}
  end
end
