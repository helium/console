defmodule ConsoleWeb.Monitor do
  def start_link(initial_state) do
    Agent.start_link(fn -> initial_state end, name: __MODULE__)
  end

  def get_router_address do
    Agent.get(__MODULE__, fn state -> Map.get(state, :address, "") end)
  end

  def update_router_address(address) do
    Agent.update(__MODULE__, fn state -> Map.put(state, :address, address) end)
  end

  def get_event_stat_running?() do
    Agent.get(__MODULE__, fn state -> Map.get(state, :running_stats, false) end)
  end

  def set_event_stat_running(status) do
    Agent.update(__MODULE__, fn state -> Map.put(state, :running_stats, status) end)
  end
end
