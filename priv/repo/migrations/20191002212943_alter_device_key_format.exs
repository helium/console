defmodule Console.Repo.Migrations.AlterDeviceKeyFormat do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      remove :key
      add :key, :string
    end
  end
end
