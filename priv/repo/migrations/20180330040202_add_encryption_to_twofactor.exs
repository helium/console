defmodule Console.Repo.Migrations.AddEncryptionToTwofactor do
  use Ecto.Migration

  def change do
    alter table(:twofactors) do
      add :encryption_version, :binary
      remove :secret
      add :secret, :binary
    end

    create index(:twofactors, [:encryption_version])
  end
end
