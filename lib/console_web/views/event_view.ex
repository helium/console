defmodule ConsoleWeb.EventView do
  use ConsoleWeb, :view
  alias ConsoleWeb.EventView

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
      category: event.category,
      sub_category: event.sub_category,
      reported_at: event.reported_at,
      data: event.data,
      frame_up: event.frame_up,
      frame_down: event.frame_down,
      organization_id: event.organization_id,
      router_uuid: event.router_uuid,
      device_id: event.device_id
    }
  end

end
