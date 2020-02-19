defmodule Console.Repo.Migrations.RemoveDevicesChannelsTable do
  use Ecto.Migration

  def change do
    drop table(:devices_channels)
  end
end
