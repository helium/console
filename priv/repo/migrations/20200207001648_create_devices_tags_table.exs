defmodule Console.Repo.Migrations.CreateDevicesLabelsTable do
  use Ecto.Migration

  def change do
    create table(:devices_labels) do
      add :device_id, references(:devices)
      add :label_id, references(:labels)

      timestamps()
    end

    create unique_index(:devices_labels, [:device_id, :label_id])
  end
end
