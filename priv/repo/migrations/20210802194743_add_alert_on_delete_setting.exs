defmodule Console.Repo.Migrations.AddAlertOnDeleteSetting do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE alerts DROP CONSTRAINT alerts_organization_id_fkey"
    alter table(:alerts) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE alerts DROP CONSTRAINT alerts_organization_id_fkey"
    alter table(:alerts) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end
  end
end
