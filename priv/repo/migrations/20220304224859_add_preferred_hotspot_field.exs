defmodule Console.Repo.Migrations.AddPreferredHotspotField do
  use Ecto.Migration

  def change do
    alter table(:organization_hotspots) do
      add :preferred, :boolean, null: false, default: false
    end
  end
end
