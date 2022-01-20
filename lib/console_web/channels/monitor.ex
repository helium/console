defmodule ConsoleWeb.Monitor do
  use Agent

  def start_link(initial_state) do
    Agent.start_link(fn -> initial_state end, name: __MODULE__)
  end

  def get_router_address do
    Agent.get(__MODULE__, fn state -> Map.get(state, :address) end)
  end

  def update_router_address(address) do
    Agent.update(__MODULE__, fn state -> Map.put(state, :address, address) end)
  end

  def get_events_state do
    Agent.get(__MODULE__, fn state -> Map.get(state, :events_state) end)
  end

  def add_to_events_state(tag, payload) do
    Agent.update(__MODULE__, fn state -> Map.put(state, :events_state, [{tag, payload} | state.events_state]) end)
  end

  def remove_from_events_state(count) do
    Agent.update(__MODULE__, fn state -> Map.put(state, :events_state, Enum.drop(state.events_state, -1 * count)) end)
  end

  def get_amqp_conn do
    Agent.get(__MODULE__, fn state -> Map.get(state, :amqp_conn) end)
  end

  def update_amqp_conn(tag) do
    Agent.update(__MODULE__, fn state -> Map.put(state, :amqp_conn, tag) end)
  end
end
