defmodule Console.Repo.Migrations.AddTeams do
  use Ecto.Migration

  def change do
    create table("teams") do
      add :name, :string, null: false

      timestamps()
    end

  end
end
