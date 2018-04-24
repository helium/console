defmodule Console.Repo.Migrations.CreateDevicesGroups do
  use Ecto.Migration

  def change do
    create table(:devices_groups) do
      add :device_id, references(:devices)
      add :group_id, references(:groups)

      timestamps()
    end

    create unique_index(:devices_groups, [:device_id, :group_id])
  end
end
