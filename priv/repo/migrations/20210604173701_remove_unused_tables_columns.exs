defmodule Console.Repo.Migrations.RemoveUnusedTablesColumns do
  use Ecto.Migration

  def change do
    drop table(:channels_labels)

    alter table(:labels) do
      remove :function_id
    end

    alter table(:labels) do
      remove :multi_buy
    end
  end
end
