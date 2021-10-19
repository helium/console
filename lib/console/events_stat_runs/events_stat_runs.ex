defmodule Console.EventsStatRuns do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.EventsStatRuns.EventsStatRun

  def get_latest() do
    EventsStatRun
      |> order_by(desc: :reported_at_epoch)
      |> limit(1)
      |> Repo.one()
  end

  def create_events_stat_run(attrs \\ %{}) do
    %EventsStatRun{}
    |> EventsStatRun.changeset(attrs)
    |> Repo.insert()
  end
end
