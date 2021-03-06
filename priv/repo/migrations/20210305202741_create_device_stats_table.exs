defmodule Console.Repo.Migrations.CreateDeviceStatsTable do
  use Ecto.Migration

  def change do
    create table(:device_stats, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :router_uuid, :string
      add :payload_size, :integer
      add :dc_used, :integer
      add :reported_at_epoch, :bigint
      add :device_id, references(:devices, on_delete: :delete_all, type: :binary_id)
      add :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id)

      timestamps()
    end

    create index(:device_stats, [:device_id, :reported_at_epoch])
  end
end
