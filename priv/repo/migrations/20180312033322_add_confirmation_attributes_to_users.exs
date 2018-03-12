defmodule Console.Repo.Migrations.AddConfirmationAttributesToUsers do
  use Ecto.Migration

  def change do
    alter table("users") do
      add :confirmation_token, :string
      add :confirmed_at, :naive_datetime
    end

    create index("users", ["confirmation_token"])
  end
end
