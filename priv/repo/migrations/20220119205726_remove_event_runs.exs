defmodule Console.Repo.Migrations.RemoveEventRuns do
  use Ecto.Migration

  def change do
    drop table(:events_stat_runs)
  end
end
