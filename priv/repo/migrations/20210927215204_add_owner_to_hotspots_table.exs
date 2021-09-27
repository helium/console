defmodule Console.Repo.Migrations.AddOwnerToHotspotsTable do
  use Ecto.Migration

  def up do
    alter table(:hotspots) do
      add :owner, :string, null: true
      modify :status, :string, null: true
    end
  end

  def down do
    alter table(:hotspots) do
      remove :owner
      modify :status, :string, null: false
    end
  end
end
