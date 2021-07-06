defmodule Console.Repo.Migrations.AddCfListSettingToLabels do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      add :cf_list_enabled, :boolean, null: false, default: true
    end
  end
end
