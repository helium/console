defmodule Console.Repo.Migrations.AddOnDeleteToMemos do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE memos DROP CONSTRAINT memos_organization_id_fkey"

    alter table(:memos) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE memos DROP CONSTRAINT memos_organization_id_fkey"

    alter table(:memos) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end
  end
end
