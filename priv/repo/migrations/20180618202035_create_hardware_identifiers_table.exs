defmodule Console.Repo.Migrations.CreateHardwareIdentifiersTable do
  use Ecto.Migration

  def change do
    create table(:hardware_identifiers, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :token, :binary, null: false
      timestamps()
    end

    create unique_index(:hardware_identifiers, [:token])

    alter table(:gateways) do
      add :hardware_identifier_id, references(:hardware_identifiers, on_delete: :nothing, type: :binary_id), null: false
    end
  end
end
