defmodule Console.Repo.Migrations.AddOrgIdToEvents do
  use Ecto.Migration

  def change do
    alter table(:events) do
      add :organization_id, references(:organizations, on_delete: :delete_all)
    end

    create index(:events, [:organization_id])
  end
end
