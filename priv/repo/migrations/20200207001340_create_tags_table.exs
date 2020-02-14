defmodule Console.Repo.Migrations.CreateLabelsTable do
  use Ecto.Migration

  def change do
    create table(:labels) do
      add :name, :string, null: false
      add :organization_id, references(:organizations)

      timestamps()
    end

    create unique_index(:labels, [:name, :organization_id], name: :labels_name_organization_id_index)
  end
end
