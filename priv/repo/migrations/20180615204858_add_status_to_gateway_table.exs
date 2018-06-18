defmodule Console.Repo.Migrations.AddStatusToGatewayTable do
  use Ecto.Migration

  def change do
    alter table(:gateways) do
      add :status, :string
    end

    execute """
    UPDATE gateways
    SET status = 'verified'
    """

    alter table(:gateways) do
      modify :status, :string, null: false
    end
  end
end
