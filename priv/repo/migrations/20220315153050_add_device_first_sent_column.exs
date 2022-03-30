defmodule Console.Repo.Migrations.AddDeviceFirstSentColumn do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :first_packet_received_at, :naive_datetime
    end
  end
end
