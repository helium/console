defmodule Console.Repo.Migrations.AddHotspotsTables do
  use Ecto.Migration

  def change do
    create table(:hotspot_stats, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :router_uuid, :string
      add :hotspot_address, :string
      add :reported_at_epoch, :bigint
      add :device_id, references(:devices, on_delete: :delete_all, type: :binary_id)
      add :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id)
      add :rssi, :float
      add :snr, :float
      add :channel, :string
      add :spreading, :string
      add :category, :string
      add :sub_category, :string

      timestamps()
    end

    create table(:organization_hotspots, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :hotspot_address, :string
      add :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id)
      add :claimed, :boolean, null: false, default: false
      add :alias, :string

      timestamps()
    end

    create table(:hotspots, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :status, :string, null: false
      add :height, :integer, null: false
      add :location, :string, null: false
      add :lat, :decimal, null: false
      add :lng, :decimal, null: false
      add :short_state, :string, null: false
      add :short_country, :string, null: false
      add :long_city, :string, null: false
      add :address, :string, null: false

      timestamps()
    end

    create index(:hotspot_stats, [:hotspot_address, :reported_at_epoch])
    create index(:hotspot_stats, [:organization_id, :reported_at_epoch])

    create index(:organization_hotspots, [:organization_id])

    create index(:hotspots, [:address])
  end
end
