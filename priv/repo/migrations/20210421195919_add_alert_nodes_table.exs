defmodule Console.Repo.Migrations.AddAlertNodesTable do
  use Ecto.Migration

  def change do
    create table(:alert_nodes, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :alert_id, references(:alerts, on_delete: :delete_all), null: false
      add :node_id, :binary_id, null: false
      add :node_type, :string, null: false

      timestamps()
    end

    create index(:alert_nodes, [:node_type])
  end
end
