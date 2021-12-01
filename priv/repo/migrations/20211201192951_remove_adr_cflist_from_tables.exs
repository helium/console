defmodule Console.Repo.Migrations.RemoveAdrCflistFromTables do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      remove :adr_allowed
      remove :cf_list_enabled
    end

    alter table(:devices) do
      remove :adr_allowed
      remove :cf_list_enabled
    end
  end
end
