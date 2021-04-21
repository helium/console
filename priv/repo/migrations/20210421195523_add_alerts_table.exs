defmodule Console.Repo.Migrations.AddAlertsTable do
  use Ecto.Migration

  def change do
    create table(:alerts, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :name, :string, null: false
      add :last_triggered_at, :naive_datetime
      add :node_type, :string, null: false
      add :config, :map, default: %{}, null: false
      add :organization_id, references(:organizations)

      timestamps()
    end

    create index(:alerts, [:node_type])
    create index(:alerts, [:organization_id])
  end
end