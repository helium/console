defmodule Console.Repo.Migrations.AddDeviceEventWorkerRelatedTables do
  use Ecto.Migration

  def change do
    create table(:events_stat_runs, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :reported_at_epoch, :bigint, null: false
      add :last_event_id, :string, null: false

      timestamps()
    end

    create index(:events_stat_runs, [:reported_at_epoch])
    create_if_not_exists index(:events, [:reported_at_epoch])
  end
end
