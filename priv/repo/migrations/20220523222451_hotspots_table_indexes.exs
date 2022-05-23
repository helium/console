defmodule Console.Repo.Migrations.HotspotsTableIndexes do
  use Ecto.Migration

  def change do
    create index(:hotspots, [:name])
    create index(:hotspots, [:long_city])
  end
end
