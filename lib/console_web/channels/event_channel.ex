defmodule ConsoleWeb.EventChannel do
  use Phoenix.Channel

  def join("event:all", _message, socket) do
    {:ok, socket}
  end

  def join("event:" <> _private_event_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end
end
