defmodule Console.Repo.Migrations.AddHotspotAddressToDevicesTable do
  use Ecto.Migration

  def up do
    alter table("devices") do
      add_if_not_exists :hotspot_address, :string
    end
    create index(:devices, [:hotspot_address])
  end

  def down do
    drop index(:devices, [:hotspot_address])
    alter table("devices") do
      remove :hotspot_address
    end
  end
end
