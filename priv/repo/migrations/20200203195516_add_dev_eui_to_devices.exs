defmodule Console.Repo.Migrations.AddDevEuiToDevices do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :dev_eui, :string
    end
  end
end
