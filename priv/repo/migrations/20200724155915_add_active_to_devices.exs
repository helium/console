defmodule Console.Repo.Migrations.AddActiveToDevices do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :active, :boolean, null: false, default: true
    end
  end
end
