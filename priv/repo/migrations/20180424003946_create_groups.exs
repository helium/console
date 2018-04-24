defmodule Console.Repo.Migrations.CreateGroups do
  use Ecto.Migration

  def change do
    create table("groups") do
      add :name, :string, null: false
      add :team_id, references(:teams)

      timestamps()
    end

    create unique_index(:groups, [:name, :team_id], name: :groups_name_team_id_index)
  end
end
