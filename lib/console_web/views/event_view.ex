defmodule ConsoleWeb.EventView do
  use ConsoleWeb, :view
  alias ConsoleWeb.EventView
  alias ConsoleWeb.DeviceView
  alias ConsoleWeb.GatewayView
  alias ConsoleWeb.ChannelView

  def render("index.json", %{events: events}) do
    render_many(events, EventView, "event.json")
  end

  def render("show.json", %{event: event}) do
    render_one(event, EventView, "event.json")
  end

  def render("event.json", %{event: event}) do
    %{
      id: event.id,
      description: event.description,
      payload_size: event.payload_size,
      reported_at: event.reported_at,
    }
  end
end
