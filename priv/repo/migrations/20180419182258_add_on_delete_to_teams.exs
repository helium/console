defmodule Console.Repo.Migrations.AddOnDeleteToTeams do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE memberships DROP CONSTRAINT memberships_team_id_fkey"

    alter table(:memberships) do
      modify(:team_id, references(:teams, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE memberships DROP CONSTRAINT memberships_team_id_fkey"

    alter table(:memberships) do
      modify(:team_id, references(:teams, on_delete: :nothing))
    end
  end
end
