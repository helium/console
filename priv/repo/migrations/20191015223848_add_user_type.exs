defmodule Console.Repo.Migrations.AddUserType do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :super, :boolean
    end
  end
end
