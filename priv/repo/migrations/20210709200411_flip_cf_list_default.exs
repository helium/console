defmodule Console.Repo.Migrations.FlipCfListDefault do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      remove :cf_list_enabled
    end

    alter table(:labels) do
      add :cf_list_enabled, :boolean, null: false, default: false
    end
  end
end
