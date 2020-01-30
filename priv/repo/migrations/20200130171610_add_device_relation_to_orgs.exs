defmodule Console.Repo.Migrations.AddDeviceRelationToOrgs do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE devices DROP CONSTRAINT devices_organization_id_fkey"
    alter table(:devices) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE devices DROP CONSTRAINT devices_organization_id_fkey"
    alter table(:devices) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end
  end
end
