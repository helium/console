defmodule Console.Repo.Migrations.ChangeDeviceHotspotAddressIndex do
  use Ecto.Migration

  def change do
    drop index(:devices, [:hotspot_address])
    create unique_index(:devices, [:hotspot_address])
  end
end
