defmodule Console.Repo.Migrations.AddDeviceReportedAtIndexToEvents do
  use Ecto.Migration

  def change do
    create index(:events, [:reported_at_naive, :device_id])
  end
end
