defmodule Console.Repo.Migrations.ChangeEventTable do
  use Ecto.Migration

  def up do
    alter table(:events) do
      remove :hotspots
      remove :channels
      remove :payload_size
      remove :dc_used
      remove :frame_up
      remove :frame_down
      remove :port
      remove :devaddr
      add :sub_category, :string
      add :data, :map, default: %{}, null: false
      add :router_uuid, :string
    end
  end

  def down do
    alter table(:events) do
      add :hotspots, {:array, :map}
      add :channels, {:array, :map}
      add :payload_size, :integer
      add :dc_used, :integer
      add :frame_up, :integer
      add :frame_down, :integer
      add :port, :integer
      add :devaddr, :string
      remove :sub_category
      remove :data
      remove :router_uuid
    end
  end
end
