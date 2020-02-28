defmodule Console.Repo.Migrations.CreateUserApiKeysTabel do
  use Ecto.Migration

  def change do
    create table(:api_keys) do
      add :name, :string, null: false
      add :role, :string, null: false
      add :key, :binary, null: false
      add :user_id, references(:users)
      add :organization_id, references(:organizations)

      timestamps()
    end
  end
end
