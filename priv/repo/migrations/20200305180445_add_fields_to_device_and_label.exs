defmodule Console.Repo.Migrations.AddFieldsToDeviceAndLabel do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :frame_up, :integer
      add :frame_down, :integer
      add :last_connected, :naive_datetime

      remove :seq_id
      remove :key
    end

    alter table(:labels) do
      add :creator, :string
    end
  end
end
