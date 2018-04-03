defmodule Console.Repo.Migrations.AddOnDeleteToDevicesGatewaysChannels do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE events DROP CONSTRAINT events_device_id_fkey"
    execute "ALTER TABLE events DROP CONSTRAINT events_gateway_id_fkey"
    execute "ALTER TABLE events DROP CONSTRAINT events_channel_id_fkey"

    alter table(:events) do
      modify(:device_id, references(:devices, on_delete: :delete_all))
      modify(:gateway_id, references(:gateways, on_delete: :delete_all))
      modify(:channel_id, references(:channels, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE events DROP CONSTRAINT events_device_id_fkey"
    execute "ALTER TABLE events DROP CONSTRAINT events_gateway_id_fkey"
    execute "ALTER TABLE events DROP CONSTRAINT events_channel_id_fkey"

    alter table(:events) do
      modify(:device_id, references(:devices, on_delete: :nothing))
      modify(:gateway_id, references(:gateways, on_delete: :nothing))
      modify(:channel_id, references(:channels, on_delete: :nothing))
    end
  end
end
