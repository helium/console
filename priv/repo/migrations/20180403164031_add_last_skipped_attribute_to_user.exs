defmodule Console.Repo.Migrations.AddLastSkippedAttributeToUser do
  use Ecto.Migration

  def change do
    alter table(:twofactors) do
      remove :last_skipped
    end

    alter table(:users) do
      add :last_2fa_skipped_at, :naive_datetime
    end
  end
end
