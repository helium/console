defmodule ConsoleWeb.V1.EventView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.EventView

  def render("event.json", %{event: event}) do
    %{
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

  def show_events(events) do
    render_many(events, EventView, "event.json")
  end
end
