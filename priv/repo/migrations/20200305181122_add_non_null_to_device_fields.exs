defmodule Console.Repo.Migrations.AddNonNullToDeviceFields do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      modify :app_eui, :string, null: false
      modify :app_key, :string, null: false
      modify :dev_eui, :string, null: false
      modify :name, :string, null: false
    end
  end
end
