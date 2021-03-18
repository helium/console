defmodule Console.Repo.Migrations.ClearEventsTable do
  use Ecto.Migration
  alias Console.Repo
  alias Console.Events.Event

  def up do
    Repo.delete_all(Event)
  end

  def down do

  end
end
