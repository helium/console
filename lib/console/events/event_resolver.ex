defmodule Console.Events.EventResolver do
  alias Console.Events

  def all(%{device_id: device_id}, %{context: %{current_team: current_team}}) do
    events = Events.list_events(device_id: device_id)
    {:ok, events}
  end

end
