defmodule Console.Repo.Migrations.AddColumnInEvents do
  use Ecto.Migration

  def change do
    alter table("events") do
      add_if_not_exists :reported_at_epoch, :bigint
    end
    # create index(:events, [:device_id, :reported_at_epoch])
  end
end
