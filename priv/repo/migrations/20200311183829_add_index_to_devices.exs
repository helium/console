defmodule Console.Repo.Migrations.AddIndexToDevices do
  use Ecto.Migration

  def change do
    create unique_index(:devices, [:dev_eui, :app_eui])
  end
end
