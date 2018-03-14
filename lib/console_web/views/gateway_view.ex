defmodule ConsoleWeb.GatewayView do
  use ConsoleWeb, :view
  alias ConsoleWeb.GatewayView

  def render("index.json", %{gateways: gateways}) do
    %{data: render_many(gateways, GatewayView, "gateway.json")}
  end

  def render("show.json", %{gateway: gateway}) do
    %{data: render_one(gateway, GatewayView, "gateway.json")}
  end

  def render("gateway.json", %{gateway: gateway}) do
    %{id: gateway.id,
      name: gateway.name,
      mac: gateway.mac,
      public_key: gateway.public_key,
      latitude: gateway.latitude,
      longitude: gateway.longitude}
  end
end
