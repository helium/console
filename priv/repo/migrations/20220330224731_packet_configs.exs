defmodule Console.Repo.Migrations.PacketConfigs do
  use Ecto.Migration

  def up do
    drop constraint(:multi_buys, "multi_buys_organization_id_fkey")
    drop index(:multi_buys, [:name, :organization_id])

    rename table(:multi_buys), to: table(:packet_configs)

    rename table(:packet_configs), :value, to: :multi_buy_value

    alter table(:packet_configs) do
      modify :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id, null: false)
      add :preferred_active, :boolean, default: false
      add :multi_active, :boolean, default: false
    end

    execute "ALTER TABLE packet_configs RENAME CONSTRAINT multi_buys_pkey TO packet_configs_pkey;"

    rename table(:devices), :multi_buy_id, to: :packet_config_id
    rename table(:labels), :multi_buy_id, to: :packet_config_id

    # Set all existing records to multi_active true since it was default as on when only setting was multibuy
    execute "UPDATE packet_configs SET multi_active = true;"

    create unique_index(:packet_configs, [:name, :organization_id])
  end
  
  def down do
    drop constraint(:packet_configs, "packet_configs_organization_id_fkey")
    drop index(:packet_configs, [:name, :organization_id])

    rename table(:packet_configs), to: table(:multi_buys)

    rename table(:multi_buys), :multi_buy_value, to: :value

    alter table(:multi_buys) do
      modify :organization_id, references(:organizations, on_delete: :delete_all, type: :binary_id, null: false)
      remove :preferred_active
      remove :multi_active
    end

    execute "ALTER TABLE multi_buys RENAME CONSTRAINT packet_configs_pkey TO multi_buys_pkey;"

    rename table(:devices), :packet_config_id, to: :multi_buy_id
    rename table(:labels), :packet_config_id, to: :multi_buy_id

    create unique_index(:multi_buys, [:name, :organization_id])
  end
end
