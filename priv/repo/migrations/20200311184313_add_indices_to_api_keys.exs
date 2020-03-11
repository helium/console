defmodule Console.Repo.Migrations.AddIndicesToApiKeys do
  use Ecto.Migration

  def change do
    drop index(:devices, [:dev_eui, :app_eui])
    create index(:devices, [:dev_eui, :app_eui])
    create index(:api_keys, [:key])
    create unique_index(:api_keys, [:name, :organization_id])
  end
end
