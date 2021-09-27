defmodule Console.Repo.Migrations.AddIndexToOwner do
  use Ecto.Migration

  def change do
    create index(:hotspots, [:owner])
  end
end
