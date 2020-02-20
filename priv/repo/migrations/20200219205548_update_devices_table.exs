defmodule Console.Repo.Migrations.UpdateDevicesTable do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :app_eui, :string
      add :app_key, :string

      remove :mac
    end
  end
end
