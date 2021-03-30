defmodule ConsoleWeb.DeviceChannel do
  use Phoenix.Channel

  def join("device:all", _message, socket) do
    {:ok, socket}
  end

  def handle_in("downlink:update_queue", payload = %{ "device" => id, "queue" => _queue }, socket) do
    ConsoleWeb.Endpoint.broadcast("graphql:device_show_downlink", "graphql:device_show_downlink:#{id}:update_queue", payload)
    {:reply, :ok, socket}
  end
end
