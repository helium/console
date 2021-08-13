defmodule Console.Repo.Migrations.UniqueHotspotAddress do
  use Ecto.Migration

  def change do
    drop index(:hotspots, [:address])
    create unique_index(:hotspots, [:address])
  end
end
