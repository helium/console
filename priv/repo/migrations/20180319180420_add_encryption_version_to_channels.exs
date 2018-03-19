defmodule Console.Repo.Migrations.AddEncryptionVersionToChannels do
  use Ecto.Migration

  def change do

    alter table(:channels) do
      add :encryption_version, :binary
    end

    create index(:channels, [:encryption_version])
  end
end
