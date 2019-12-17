defmodule ConsoleWeb.ChannelChannel do
  use Phoenix.Channel

  def join("channel:all", _message, socket) do
    {:ok, socket}
  end
end
