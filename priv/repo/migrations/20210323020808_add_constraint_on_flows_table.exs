defmodule Console.Repo.Migrations.AddConstraintOnFlowsTable do
  use Ecto.Migration

  def up do
    execute(
      "CREATE UNIQUE INDEX unique_flow_entry_index ON flows (organization_id, coalesce(device_id, '00000000-0000-0000-0000-000000000000'), coalesce(label_id, '00000000-0000-0000-0000-000000000000'), coalesce(function_id, '00000000-0000-0000-0000-000000000000'), channel_id)"
    )
  end

  def down do
    execute("DROP INDEX IF EXISTS unique_flow_entry_index")
  end
end
