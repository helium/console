defmodule Console.Repo.Migrations.AddLastLoginToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :last_login, :naive_datetime
    end
  end
end
