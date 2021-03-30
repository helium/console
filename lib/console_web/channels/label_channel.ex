defmodule ConsoleWeb.LabelChannel do
  use Phoenix.Channel

  def join("label:all", _message, socket) do
    {:ok, socket}
  end

  def handle_in("label:all:downlink:update_queue", payload, socket) do
    IO.inspect payload
    # check payload for label id and broadcast to the correct label
    # ConsoleWeb.Endpoint.broadcast("graphql:label_show_downlink", "graphql:label_show_downlink:#{id}:update_queue", payload)

    {:reply, :ok, socket}
  end
end
