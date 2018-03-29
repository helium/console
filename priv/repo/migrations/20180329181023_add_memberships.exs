defmodule Console.Repo.Migrations.AddMemberships do
  use Ecto.Migration

  def change do

    create table(:memberships) do
      add :role, :string, null: false, limit: 16
      add :user_id, references(:users)
      add :team_id, references(:teams)

      timestamps()
    end

    create unique_index(:memberships, [:user_id, :team_id])

  end
end
