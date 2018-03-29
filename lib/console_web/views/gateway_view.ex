defmodule ConsoleWeb.GatewayView do
  use ConsoleWeb, :view
  alias ConsoleWeb.GatewayView
  alias ConsoleWeb.EventView

  def render("index.json", %{gateways: gateways}) do
    render_many(gateways, GatewayView, "gateway.json")
  end

  def render("show.json", %{gateway: gateway}) do
    render_one(gateway, GatewayView, "gateway.json")
  end

  def render("gateway.json", %{gateway: gateway}) do
    %{
      id: gateway.id,
      name: gateway.name,
      mac: gateway.mac,
      latitude: gateway.latitude,
      longitude: gateway.longitude
    }
    |> append_events(gateway.events)
  end

  defp append_events(json, events) do
    if Ecto.assoc_loaded?(events) do
      events_json = render_many(events, EventView, "event.json")
      Map.put(json, :events, events_json)
    else
      json
    end
  end
end
