defmodule Console.Repo.Migrations.ChangeDeviceCombinedIndexOrdering do
  use Ecto.Migration

  def change do
    drop index(:events, [:reported_at_naive, :device_id])
    create index(:events, [:device_id, :reported_at_naive])
  end
end
