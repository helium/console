defmodule Console.Repo.Migrations.AddTypeColumnToEvents do
  use Ecto.Migration

  def change do
    alter table(:events) do
      add :type, :string
    end
  end
end
