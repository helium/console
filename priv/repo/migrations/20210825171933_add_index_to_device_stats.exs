defmodule Console.Repo.Migrations.AddIndexToDeviceStats do
  use Ecto.Migration

  def change do
    create index(:device_stats, [:organization_id])
  end
end
