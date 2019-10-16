defmodule Console.Repo.Migrations.RemoveTeamIdFromMemberships do
  use Ecto.Migration

  def change do
    alter table(:memberships) do
      remove :team_id
    end

    alter table(:invitations) do
      remove :team_id
    end
  end
end
