defmodule Console.Repo.Migrations.AddMultibuyTable do
  use Ecto.Migration

  def change do
    create table(:multi_buys, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :name, :string, null: false
      add :value, :integer, null: false, default: 1
      add :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id, null: false)

      timestamps()
    end

    create unique_index(:multi_buys, [:name, :organization_id])
  end
end
