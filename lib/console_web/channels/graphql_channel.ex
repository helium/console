defmodule ConsoleWeb.GraphqlChannel do
  use Phoenix.Channel

  def join("graphql:all", _message, socket) do
    {:ok, socket}
  end
end
