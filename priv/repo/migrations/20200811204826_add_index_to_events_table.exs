defmodule Console.Repo.Migrations.AddIndexToEventsTable do
  use Ecto.Migration

  def change do
    create index(:events, [:reported_at_naive])
  end
end
