defmodule Console.Repo.Migrations.UserVettedAttribute do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :vetted, :boolean, default: false, null: false
    end
  end
end
