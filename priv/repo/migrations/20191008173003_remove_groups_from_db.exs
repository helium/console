defmodule Console.Repo.Migrations.RemoveGroupsFromDb do
  use Ecto.Migration

  def change do
    drop table(:channels_groups)
    drop table(:devices_groups)
    drop table(:groups)
  end
end
