defmodule Console.Repo.Migrations.AddSendJoinsToIntegrationAttr do
  use Ecto.Migration

  def change do
    alter table(:channels) do
      add :receive_joins, :boolean, null: false, default: false
    end
  end
end
