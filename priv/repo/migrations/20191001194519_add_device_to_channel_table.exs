defmodule Console.Repo.Migrations.AddDeviceToChannelTable do
  use Ecto.Migration

  def change do
    create table(:devices_channels) do
      add :device_id, references(:devices)
      add :channel_id, references(:channels)

      timestamps()
    end

    create unique_index(:devices_channels, [:device_id, :channel_id], name: :device_channel_unique_index)
  end
end
