defmodule Console.Repo.Migrations.AddOwnerToHotspotsTable do
  use Ecto.Migration

  def change do
    alter table(:hotspots) do
      add :owner, :string, null: true
    end
  end
end
