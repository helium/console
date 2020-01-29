defmodule Console.Repo.Migrations.AddOrgIdToDevicesBasedOnTeam do
  use Ecto.Migration

  def up do
    execute "UPDATE devices SET organization_id = teams.organization_id FROM teams WHERE team_id = teams.id"
  end

  def down do
    execute "UPDATE devices SET organization_id = null"
  end
end
