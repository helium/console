defmodule Console.Repo.Migrations.CreateTagsTable do
  use Ecto.Migration

  def change do
    create table(:tags) do
      add :name, :string, null: false
      add :organization_id, references(:organizations)

      timestamps()
    end

    create unique_index(:tags, [:name, :organization_id], name: :tags_name_organization_id_index)
  end
end
