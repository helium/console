defmodule Console.Repo.Migrations.FixFunctionDeleteCascade do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE functions DROP CONSTRAINT functions_organization_id_fkey"
    alter table(:functions) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE functions DROP CONSTRAINT functions_organization_id_fkey"
    alter table(:functions) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end
  end
end
