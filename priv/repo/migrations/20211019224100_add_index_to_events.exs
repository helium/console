defmodule Console.Repo.Migrations.AddIndexToEvents do
  use Ecto.Migration

  def change do
    create index(:events, [:serial])
  end
end
