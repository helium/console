defmodule ConsoleWeb.EventView do
  use ConsoleWeb, :view
  alias ConsoleWeb.EventView
  alias ConsoleWeb.DeviceView

  def render("index.json", %{events: events}) do
    render_many(events, EventView, "event.json")
  end

  def render("show.json", %{event: event}) do
    render_one(event, EventView, "event.json")
  end

  def render("event.json", %{event: event}) do
    IO.puts("in render event.json")
    json = %{id: event.id,
      channel_id: event.channel_id,
      description: event.description,
      direction: event.direction,
      gateway_id: event.gateway_id,
      payload: event.payload,
      payload_size: event.payload_size,
      reported_at: event.reported_at,
      rssi: event.rssi,
      signal_strength: event.signal_strength,
      status: event.status}

    if Ecto.assoc_loaded?(event.device) do
      device = render_one(event.device, DeviceView, "device.json")
      json = Map.put(json, :device, device)
    end

    json
  end
end
