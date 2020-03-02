defmodule Console.Repo.Migrations.CreateNewEventsTable do
  use Ecto.Migration

  def change do
    create table(:events) do
      add :hotspot_name, :string
      add :channel_name, :string
      add :status, :string
      add :description, :string
      add :payload, :string
      add :payload_size, :integer
      add :rssi, :float
      add :snr, :float
      add :device_id, references(:devices)
      add :category, :string
      add :frame_up, :integer
      add :frame_down, :integer
      add :reported_at, :string
      add :reported_at_naive, :naive_datetime

      timestamps()
    end

    create index(:events, [:device_id])
  end
end
