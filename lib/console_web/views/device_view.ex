defmodule ConsoleWeb.DeviceView do
  use ConsoleWeb, :view
  alias ConsoleWeb.DeviceView
  alias ConsoleWeb.EventView

  def render("index.json", %{devices: devices}) do
    render_many(devices, DeviceView, "device.json")
  end

  def render("show.json", %{device: device}) do
    render_one(device, DeviceView, "device.json")
  end

  def render("device.json", %{device: device}) do
    if Ecto.assoc_loaded?(device.events) do
      events = render_many(device.events, EventView, "event.json")
      %{id: device.id, name: device.name, mac: device.mac, events: events}
    else
      %{id: device.id, name: device.name, mac: device.mac}
    end
  end
end
