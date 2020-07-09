defmodule Console.Repo.Migrations.AddOnDeleteToDeviceImport do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE device_imports DROP CONSTRAINT device_imports_organization_id_fkey"
    alter table(:device_imports) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end
  end
end
