defmodule Console.Repo.Migrations.CreateGateways do
  use Ecto.Migration

  def change do
    create table(:gateways, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :mac, :string
      add :public_key, :binary
      add :latitude, :decimal
      add :longitude, :decimal

      timestamps()
    end

    create unique_index(:gateways, [:mac])
  end
end
