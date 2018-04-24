defmodule Console.Repo.Migrations.AddTokenToChannel do
  use Ecto.Migration

  def change do
    alter table("channels") do
      add :token, :string
    end

    create index("channels", ["token"])
  end
end
