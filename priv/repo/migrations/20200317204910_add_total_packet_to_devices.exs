defmodule Console.Repo.Migrations.AddTotalPacketToDevices do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :total_packets, :integer, default: 0, null: false
    end
  end
end
