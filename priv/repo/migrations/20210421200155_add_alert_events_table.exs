defmodule Console.Repo.Migrations.AddAlertEventsTable do
  use Ecto.Migration

  def change do
    create table(:alert_events, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :reported_at, :naive_datetime, null: false
      add :alert_id, references(:alerts, on_delete: :delete_all), null: false
      add :node_id, :binary_id, null: false
      add :node_type, :string, null: false
      add :details, :map, default: %{}, null: false
      add :sent, :boolean, null: false, default: false
      add :event, :string, null: false

      timestamps()
    end

    create index(:alert_events, [:node_type])
    create index(:alert_events, [:event])
    create index(:alert_events, [:reported_at])
  end
end
