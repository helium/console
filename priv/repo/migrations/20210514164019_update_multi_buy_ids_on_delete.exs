defmodule Console.Repo.Migrations.UpdateMultiBuyIdsOnDelete do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE labels DROP CONSTRAINT labels_multi_buy_id_fkey"
    alter table(:labels) do
      modify :multi_buy_id, references(:multi_buys, on_delete: :nilify_all)
    end

    execute "ALTER TABLE devices DROP CONSTRAINT devices_multi_buy_id_fkey"
    alter table(:devices) do
      modify :multi_buy_id, references(:multi_buys, on_delete: :nilify_all)
    end
  end

  def down do
    execute "ALTER TABLE labels DROP CONSTRAINT labels_multi_buy_id_fkey"
    alter table(:labels) do
      modify :multi_buy_id, references(:multi_buys, on_delete: :nothing)
    end

    execute "ALTER TABLE devices DROP CONSTRAINT devices_multi_buy_id_fkey"
    alter table(:devices) do
      modify :multi_buy_id, references(:multi_buys, on_delete: :nothing)
    end
  end
end
