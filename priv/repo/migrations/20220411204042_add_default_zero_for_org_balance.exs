defmodule Console.Repo.Migrations.AddDefaultZeroForOrgBalance do
  use Ecto.Migration

  def up do
    execute("UPDATE organizations SET dc_balance = 0 WHERE dc_balance IS NULL")

    alter table(:organizations) do
      modify :dc_balance, :bigint, null: false, default: 0
    end
  end

  def down do
    alter table(:organizations) do
      modify :dc_balance, :bigint, null: true, default: nil
    end
  end
end
