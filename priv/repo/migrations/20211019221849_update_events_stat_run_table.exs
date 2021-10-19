defmodule Console.Repo.Migrations.UpdateEventsStatRunTable do
  use Ecto.Migration

  def change do
    create index(:events_stat_runs, [:inserted_at])
    drop index(:events_stat_runs, [:reported_at_epoch])
  end
end
