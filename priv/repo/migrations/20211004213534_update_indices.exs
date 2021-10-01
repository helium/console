defmodule Console.Repo.Migrations.UpdateIndices do
  use Ecto.Migration

  def change do
    create index(:hotspot_stats, [:organization_id])
    drop index(:events, [:reported_at_naive])
  end
end
