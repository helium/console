defmodule Console.Repo.Migrations.AddLocationFieldToGateways do
  use Ecto.Migration

  def change do
    alter table(:gateways) do
      add :location, :string
    end

    create index(:gateways, [:location])
  end
end
