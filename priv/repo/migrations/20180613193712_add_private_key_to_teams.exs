defmodule Console.Repo.Migrations.AddPrivateKeyToTeams do
  use Ecto.Migration

  def change do
    alter table(:teams) do
      add :encryption_version, :binary
      add :private_key, :binary
      add :public_key, :binary
      add :address, :binary
      add :address_b58, :string
    end

    create index(:teams, [:encryption_version])
  end
end
