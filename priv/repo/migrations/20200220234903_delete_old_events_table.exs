defmodule Console.Repo.Migrations.DeleteOldEventsTable do
  use Ecto.Migration

  def change do
    drop table(:events)
  end
end
