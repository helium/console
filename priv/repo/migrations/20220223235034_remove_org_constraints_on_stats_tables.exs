defmodule Console.Repo.Migrations.RemoveOrgConstraintsOnStatsTables do
  use Ecto.Migration

  def up do # removing to prevent slow device and org deletion, they get cleared with prune_events anyways
    execute "ALTER TABLE device_stats DROP CONSTRAINT device_stats_device_id_fkey"
    execute "ALTER TABLE hotspot_stats DROP CONSTRAINT hotspot_stats_device_id_fkey"
    execute "ALTER TABLE device_stats DROP CONSTRAINT device_stats_organization_id_fkey"
    execute "ALTER TABLE hotspot_stats DROP CONSTRAINT hotspot_stats_organization_id_fkey"
  end

  def down do
    alter table(:device_stats) do
      modify(:device_id, references(:devices, on_delete: :nothing))
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end

    alter table(:hotspot_stats) do
      modify(:device_id, references(:devices, on_delete: :nothing))
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end
  end
end
