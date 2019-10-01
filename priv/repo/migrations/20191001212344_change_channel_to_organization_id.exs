defmodule Console.Repo.Migrations.ChangeChannelToOrganizationId do
  use Ecto.Migration

  def change do
    alter table(:channels) do
      remove :team_id
      add :organization_id, references(:organizations)
    end
  end
end
