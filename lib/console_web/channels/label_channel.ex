defmodule ConsoleWeb.LabelChannel do
  use Phoenix.Channel

  def join("label:all", _message, socket) do
    {:ok, socket}
  end

  def handle_in("downlink:update_queue", payload = %{ "device" => _, "label" => id, "queue" => _queue }, socket) do
    ConsoleWeb.Endpoint.broadcast("graphql:label_show_downlink", "graphql:label_show_downlink:#{id}:update_queue", payload)
    {:reply, :ok, socket}
  end
end
