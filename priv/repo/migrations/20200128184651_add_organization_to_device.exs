defmodule Console.Repo.Migrations.AddOrganizationToDevice do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :organization_id, references(:organizations)
    end
  end
end
