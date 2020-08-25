defmodule Console.Repo.Migrations.RemoveEventsForeignKeyOnDevice do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE events DROP CONSTRAINT events_device_id_fkey"
  end

  def down do
    alter table(:events) do
      modify(:device_id, references(:devices, on_delete: :delete_all))
    end
  end
end
