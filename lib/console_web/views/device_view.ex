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
    %{
      id: device.id,
      name: device.name,
      organization_id: device.organization_id,
    }
  end

  def render("error.json", %{error: error}) do
    %{
      errors: [error]
    }
  end

  def render("events.json", %{events: events}) do
    render_many(events, EventView, "event.json")
  end
end
