defmodule Console.Repo.Migrations.RemoveEventsSerial do
  use Ecto.Migration

  def change do
    alter table(:events) do
      remove :serial
    end
  end
end
