defmodule Console.Repo.Migrations.AddUniqueINdexToMemo do
  use Ecto.Migration

  def change do
    create unique_index(:organizations, [:memo])
  end
end
