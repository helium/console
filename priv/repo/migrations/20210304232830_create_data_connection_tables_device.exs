defmodule Console.Repo.Migrations.CreateDataConnectionTablesDevice do
  use Ecto.Migration

  def change do
    drop table(:twofactors)

    create table(:devices_functions) do
      add :device_id, references(:devices, on_delete: :delete_all), null: false
      add :function_id, references(:functions, on_delete: :delete_all), null: false
      add :organization_id, references(:organizations, on_delete: :delete_all), null: false

      timestamps()
    end

    create table(:devices_channels) do
      add :device_id, references(:devices, on_delete: :delete_all), null: false
      add :channel_id, references(:channels, on_delete: :delete_all), null: false
      add :organization_id, references(:organizations, on_delete: :delete_all), null: false

      timestamps()
    end

    create table(:functions_channels) do
      add :function_id, references(:functions, on_delete: :delete_all), null: false
      add :channel_id, references(:channels, on_delete: :delete_all), null: false
      add :organization_id, references(:organizations, on_delete: :delete_all), null: false

      timestamps()
    end

    create unique_index(:devices_functions, [:device_id, :function_id])
    create unique_index(:devices_channels, [:device_id, :channel_id])
    create unique_index(:functions_channels, [:function_id, :channel_id])
  end
end
