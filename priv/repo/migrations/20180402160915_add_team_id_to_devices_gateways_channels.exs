defmodule Console.Repo.Migrations.AddTeamIdToDevicesGatewaysChannels do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :team_id, references(:teams)
    end

    alter table(:gateways) do
      add :team_id, references(:teams)
    end

    alter table(:channels) do
      add :team_id, references(:teams)
    end
  end
end
