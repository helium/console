defmodule ConsoleWeb.Monitor do
  use Agent

  def start_link(initial_state) do
    Agent.start_link(fn -> initial_state end, name: __MODULE__)
  end

  def get_router_address do
    Agent.get(__MODULE__, fn state -> Map.get(state, :address, "") end)
  end

  def update_router_address(address) do
    Agent.update(__MODULE__, fn state -> Map.put(state, :address, address) end)
  end
end
