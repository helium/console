defmodule Console.Repo.Migrations.AddTeamIdToEvents do
  use Ecto.Migration

  def change do
    alter table(:events) do
      add :team_id, :binary_id
    end
  end
end
