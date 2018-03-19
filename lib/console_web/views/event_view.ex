defmodule ConsoleWeb.EventView do
  use ConsoleWeb, :view
  alias ConsoleWeb.EventView

  def render("index.json", %{events: events}) do
    %{data: render_many(events, EventView, "event.json")}
  end

  def render("show.json", %{event: event}) do
    %{data: render_one(event, EventView, "event.json")}
  end

  def render("event.json", %{event: event}) do
    %{id: event.id,
      description: event.description,
      direction: event.direction,
      payload: event.payload,
      payload_size: event.payload_size,
      reported_at: event.reported_at,
      rssi: event.rssi,
      signal_strength: event.signal_strength,
      status: event.status}
  end
end
