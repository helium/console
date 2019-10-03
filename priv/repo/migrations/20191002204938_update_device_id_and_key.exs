defmodule Console.Repo.Migrations.UpdateDeviceIdAndKey do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      remove :public_key
      add :seq_id, :integer
      add :key, :binary
    end
  end
end
