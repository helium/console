defmodule Console.Repo.Migrations.AddOnDeleteToTeamRelationships do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE devices DROP CONSTRAINT devices_team_id_fkey"
    alter table(:devices) do
      modify(:team_id, references(:teams, on_delete: :delete_all))
    end

    execute "ALTER TABLE gateways DROP CONSTRAINT gateways_team_id_fkey"
    alter table(:gateways) do
      modify(:team_id, references(:teams, on_delete: :delete_all))
    end

    execute "ALTER TABLE audit_trails DROP CONSTRAINT audit_trails_team_id_fkey"
    alter table(:audit_trails) do
      modify(:team_id, references(:teams, on_delete: :delete_all))
    end

    execute "ALTER TABLE notifications DROP CONSTRAINT notifications_team_id_fkey"
    alter table(:notifications) do
      modify(:team_id, references(:teams, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE devices DROP CONSTRAINT devices_team_id_fkey"
    alter table(:devices) do
      modify(:team_id, references(:teams, on_delete: :nothing))
    end

    execute "ALTER TABLE gateways DROP CONSTRAINT gateways_team_id_fkey"
    alter table(:gateways) do
      modify(:team_id, references(:teams, on_delete: :nothing))
    end

    execute "ALTER TABLE audit_trails DROP CONSTRAINT audit_trails_team_id_fkey"
    alter table(:audit_trails) do
      modify(:team_id, references(:teams, on_delete: :nothing))
    end

    execute "ALTER TABLE notifications DROP CONSTRAINT notifications_team_id_fkey"
    alter table(:notifications) do
      modify(:team_id, references(:teams, on_delete: :nothing))
    end
  end
end
