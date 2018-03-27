defmodule Console.Repo.Migrations.Add2faAttributesToUsers do
  use Ecto.Migration

  def change do
    alter table("users") do
      add :two_factor_enabled, :boolean, default: false, null: false
      add :two_factor_secret, :string
      add :two_factor_last_confirmed, :naive_datetime
      add :two_factor_last_skipped, :naive_datetime
    end
  end
end
