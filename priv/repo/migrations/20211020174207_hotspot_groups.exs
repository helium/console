defmodule Console.Repo.Migrations.HotspotGroups do
  use Ecto.Migration

  def change do
    create table(:groups, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :name, :string, null: false
      add :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id, null: false)

      timestamps()
    end

    create table(:hotspots_groups) do
      add :group_id, references(:groups)
      add :hotspot_id, references(:hotspots)

      timestamps()
    end

    create unique_index(:hotspots_groups, [:group_id, :hotspot_id])
    create unique_index(:groups, [:name, :organization_id])
  end
end
