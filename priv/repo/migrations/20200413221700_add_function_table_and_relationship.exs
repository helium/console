defmodule Console.Repo.Migrations.AddFunctionTableAndRelationship do
  use Ecto.Migration

  def change do
    create table(:functions) do
      add :name, :string, null: false
      add :body, :string, null: false
      add :type, :string, null: false
      add :format, :string, null: false
      add :organization_id, references(:organizations), null: false, on_delete: :delete_all

      timestamps()
    end

    alter table(:labels) do
      add :function_id, references(:functions)
    end
  end
end
