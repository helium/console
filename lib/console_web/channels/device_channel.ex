defmodule ConsoleWeb.DeviceChannel do
  use Phoenix.Channel

  def join("device:all", _message, socket) do
    {:ok, socket}
  end
end
