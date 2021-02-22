defmodule ConsoleWeb.Monitor do
  def start_link(initial_state) do
    Agent.start_link(fn -> initial_state end, name: __MODULE__)
  end

  def get_router_address do
    Agent.get(__MODULE__, fn state -> state end)
  end

  def update_router_address(address) do
    Agent.update(__MODULE__, fn _ -> address end)
  end
end
