defmodule Console.Repo.Migrations.UpdateEventsStatRunTable do
  use Ecto.Migration

  def change do
    alter table(:events) do
      add :serial, :serial
    end

    create index(:events_stat_runs, [:inserted_at])
    drop index(:events_stat_runs, [:reported_at_epoch])
  end
end
