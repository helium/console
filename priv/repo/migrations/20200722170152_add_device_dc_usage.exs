defmodule Console.Repo.Migrations.AddDeviceDcUsage do
  use Ecto.Migration

  def up do
    alter table(:devices) do
      add :dc_usage, :integer, null: false, default: 0
    end
  end
end
