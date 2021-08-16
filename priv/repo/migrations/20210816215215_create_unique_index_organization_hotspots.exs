defmodule Console.Repo.Migrations.CreateUniqueIndexOrganizationHotspots do
  use Ecto.Migration

  def change do
    create unique_index(:organization_hotspots, [:organization_id, :hotspot_address])
  end
end
