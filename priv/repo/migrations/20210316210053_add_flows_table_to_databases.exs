defmodule Console.Repo.Migrations.AddFlowsTableToDatabases do
  use Ecto.Migration

  def change do
    create table(:flows, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id)
      add :device_id, references(:devices, on_delete: :delete_all, type: :binary_id)
      add :label_id, references(:labels, on_delete: :delete_all, type: :binary_id)
      add :function_id, references(:functions, on_delete: :delete_all, type: :binary_id)
      add :channel_id, references(:channels, on_delete: :delete_all, type: :binary_id)

      timestamps()
    end

    create index(:flows, [:organization_id])
  end
end
