defmodule Console.Repo.Migrations.CreateDevices do
  use Ecto.Migration

  def change do
    create table(:devices, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :mac, :string
      add :public_key, :binary

      timestamps()
    end

    create unique_index(:devices, [:mac])
  end
end
