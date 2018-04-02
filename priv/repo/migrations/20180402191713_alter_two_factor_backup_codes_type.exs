defmodule Console.Repo.Migrations.AlterTwoFactorBackupCodesType do
  use Ecto.Migration

  def change do
    alter table(:twofactors) do
      remove :backup_codes
      add :backup_codes, {:array, :string}
    end
  end
end
