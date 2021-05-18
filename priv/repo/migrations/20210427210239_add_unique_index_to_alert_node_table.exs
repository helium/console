defmodule Console.Repo.Migrations.AddUniqueIndexToAlertNodeTable do
  use Ecto.Migration

  def change do
    create unique_index(:alert_nodes, [:alert_id, :node_id, :node_type])
  end
end
