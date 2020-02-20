defmodule Console.Repo.Migrations.UpdateDevicesTable do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :app_eui, :string
      add :app_key, :string

      remove :mac
    end
  end
end

# Run after db script
# alter table(:devices) do
#   modify :app_eui, :string, null: false
#   modify :app_key, :string, null: false
#   modify :dev_eui, :string, null: false
#   modify :name, :string, null: false
#   remove :key
#   remove :seq_id
# end
