defmodule Console.Repo.Migrations.ChangeOnDeleteHotspotsGroups do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE hotspots_groups DROP CONSTRAINT hotspots_groups_group_id_fkey"
    alter table(:hotspots_groups) do
      modify(:group_id, references(:groups, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE hotspots_groups DROP CONSTRAINT hotspots_groups_group_id_fkey"
    alter table(:hotspots_groups) do
      modify(:group_id, references(:groups, on_delete: :nothing))
    end
  end
end
