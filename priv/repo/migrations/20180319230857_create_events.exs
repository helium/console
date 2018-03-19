defmodule Console.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :description, :string
      add :direction, :string
      add :payload, :text
      add :payload_size, :integer
      add :reported_at, :naive_datetime
      add :rssi, :float
      add :signal_strength, :integer
      add :status, :string
      add :device_id, references(:devices, on_delete: :nothing, type: :binary_id)
      add :gateway_id, references(:gateways, on_delete: :nothing, type: :binary_id)
      add :channel_id, references(:channels, on_delete: :nothing, type: :binary_id)

      timestamps()
    end

    create index(:events, [:device_id])
    create index(:events, [:gateway_id])
    create index(:events, [:channel_id])
  end
end
