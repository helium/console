defmodule Console.Repo.Migrations.RemoveJoinTables do
  use Ecto.Migration

  def change do
    drop table(:devices_functions)
    drop table(:devices_channels)
    drop table(:functions_channels)
  end
end
