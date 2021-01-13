defmodule Console.Repo.Migrations.AddFirstReceivedPacketToChannels do
  use Ecto.Migration

  def change do
    alter table(:channels) do
      add :time_first_uplink, :naive_datetime, null: true
    end

    create index(:channels, [:time_first_uplink])
  end
end
