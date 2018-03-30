defmodule Console.Repo.Migrations.AddBackupCodesToTwofactor do
  use Ecto.Migration

  def change do
    alter table(:twofactors) do
      add :backup_codes, :binary
    end
  end
end
