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
    %{
      id: event.id,
      channel_id: event.channel_id,
      description: event.description,
      direction: event.direction,
      gateway_id: event.gateway_id,
      payload: event.payload,
      payload_size: event.payload_size,
      reported_at: event.reported_at,
      rssi: event.rssi,
      signal_strength: event.signal_strength,
      status: event.status
    }
    |> append_device(event.device)
  end

  defp append_device(json, device) do
    case Ecto.assoc_loaded?(device) do
      true ->
        device_json = render_one(device, DeviceView, "device.json")
        Map.put(json, :device, device_json)

      false ->
        json
    end
  end
end
