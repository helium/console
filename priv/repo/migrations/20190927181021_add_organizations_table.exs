defmodule Console.Repo.Migrations.AddOrganizationsTable do
  use Ecto.Migration

  def change do
    create table("organizations") do
      add :name, :string, null: false

      timestamps()
    end

    alter table(:teams) do
      add :organization_id, references(:organizations)
    end

    alter table(:invitations) do
      add :organization_id, references(:organizations)
    end

    alter table(:memberships) do
      add :organization_id, references(:organizations)
    end
  end
end
