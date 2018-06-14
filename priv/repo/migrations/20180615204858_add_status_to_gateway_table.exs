defmodule Console.Repo.Migrations.AddStatusToGatewayTable do
  use Ecto.Migration

  def change do
    alter table(:gateways) do
      add :status, :string
    end

    execute """
    UPDATE gateways
    SET status = 'Verified'
    """
  end
end
