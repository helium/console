defmodule Console.Repo.Migrations.CreateChannels do
  use Ecto.Migration

  def change do
    create table(:channels, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string
      add :type, :string
      add :active, :boolean, default: false, null: false
      add :credentials, :binary

      timestamps()
    end

  end
end
