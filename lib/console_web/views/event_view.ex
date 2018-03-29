defmodule ConsoleWeb.EventView do
  use ConsoleWeb, :view
  alias ConsoleWeb.EventView
  alias ConsoleWeb.DeviceView
  alias ConsoleWeb.GatewayView

  def render("index.json", %{events: events}) do
    render_many(events, EventView, "event.json")
  end

  def render("show.json", %{event: event}) do
    render_one(event, EventView, "event.json")
  end

  def render("event.json", %{event: event}) do
    %{
      id: event.id,
      channel_id: event.channel_id,
      description: event.description,
      direction: event.direction,
      payload: event.payload,
      payload_size: event.payload_size,
      reported_at: event.reported_at,
      rssi: event.rssi,
      signal_strength: event.signal_strength,
      status: event.status
    }
    |> append_device(event.device)
    |> append_gateway(event.gateway)
  end

  defp append_device(json, device) do
    if Ecto.assoc_loaded?(device) do
      device_json = render_one(device, DeviceView, "device.json")
      Map.put(json, :device, device_json)
    else
      json
    end
  end

  defp append_gateway(json, gateway) do
    if Ecto.assoc_loaded?(gateway) do
      gateway_json = render_one(gateway, GatewayView, "gateway.json")
      Map.put(json, :gateway, gateway_json)
    else
      json
    end
  end
end
