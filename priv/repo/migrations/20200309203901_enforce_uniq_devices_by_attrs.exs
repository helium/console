defmodule Console.Repo.Migrations.EnforceUniqDevicesByAttrs do
  use Ecto.Migration

  def change do
    create unique_index(:devices, [:dev_eui, :app_eui, :app_key])
  end
end
