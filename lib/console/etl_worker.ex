defmodule Console.EtlWorker do
  use GenServer

  def start_link(initial_state) do
    GenServer.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  def init(_opts) do
    # schedule_events_etl(100)
    {:ok, %{}}
  end

  def handle_info(:run_events_etl, state) do
    Task.Supervisor.async_nolink(ConsoleWeb.TaskSupervisor, fn ->
      events = Agent.get(:events_state, fn list -> list end)
      parsed_events = Enum.map(events, fn e -> elem(e, 1) |> Jason.decode!() end)
      IO.inspect parsed_events

      Process.sleep(5000)
    end)
    |> Task.await(:infinity)

    schedule_events_etl(1)
    {:noreply, state}
  end

  defp schedule_events_etl(wait_time) do
    Process.send_after(self(), :run_events_etl, wait_time)
  end
end
