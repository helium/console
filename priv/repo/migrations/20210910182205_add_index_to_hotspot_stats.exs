defmodule Console.Repo.Migrations.AddIndexToHotspotStats do
  use Ecto.Migration

  def change do
    create index(:hotspot_stats, [:device_id])
  end
end
