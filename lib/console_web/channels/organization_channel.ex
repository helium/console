defmodule ConsoleWeb.OrganizationChannel do
  use Phoenix.Channel

  def join("organization:all", _message, socket) do
    {:ok, socket}
  end

  def handle_in("router:address", %{"address" => router_address}, socket) do
    router_address
    |> to_string()
    |> ConsoleWeb.Monitor.update_router_address()

    {:reply, :ok, socket}
  end
end
