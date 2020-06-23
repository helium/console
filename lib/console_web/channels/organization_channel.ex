defmodule ConsoleWeb.OrganizationChannel do
  use Phoenix.Channel

  def join("organization:all", _message, socket) do
    {:ok, socket}
  end
end
