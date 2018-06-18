defmodule Console.Repo.Migrations.CreateGatewayIdentifiersTable do
  use Ecto.Migration

  def change do
    create table(:gateway_identifiers, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :unique_identifier, :binary, null: false
      timestamps()
    end

    create unique_index(:gateway_identifiers, [:unique_identifier])

    alter table(:gateways) do
      add :gateway_identifier_id, references(:gateway_identifiers, on_delete: :nothing, type: :binary_id), null: false
    end
  end
end
