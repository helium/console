defmodule Console.Repo.Migrations.AddOnDeleteCascade do
  use Ecto.Migration

  def up do
    execute "ALTER TABLE api_keys DROP CONSTRAINT api_keys_organization_id_fkey"
    alter table(:api_keys) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end

    execute "ALTER TABLE channels DROP CONSTRAINT channels_organization_id_fkey"
    alter table(:channels) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end

    execute "ALTER TABLE events DROP CONSTRAINT events_device_id_fkey"
    alter table(:events) do
      modify(:device_id, references(:devices, on_delete: :delete_all))
    end

    execute "ALTER TABLE invitations DROP CONSTRAINT invitations_organization_id_fkey"
    alter table(:invitations) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end

    execute "ALTER TABLE labels DROP CONSTRAINT labels_organization_id_fkey"
    alter table(:labels) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end

    execute "ALTER TABLE memberships DROP CONSTRAINT memberships_organization_id_fkey"
    alter table(:memberships) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end

    execute "ALTER TABLE twofactors DROP CONSTRAINT twofactors_user_id_fkey"
    alter table(:twofactors) do
      modify(:user_id, references(:users, on_delete: :delete_all))
    end

    execute "ALTER TABLE channels_labels DROP CONSTRAINT channels_labels_channel_id_fkey"
    execute "ALTER TABLE channels_labels DROP CONSTRAINT channels_labels_label_id_fkey"
    alter table(:channels_labels) do
      modify(:channel_id, references(:channels, on_delete: :delete_all))
      modify(:label_id, references(:labels, on_delete: :delete_all))
    end

    execute "ALTER TABLE devices_labels DROP CONSTRAINT devices_labels_device_id_fkey"
    execute "ALTER TABLE devices_labels DROP CONSTRAINT devices_labels_label_id_fkey"
    alter table(:devices_labels) do
      modify(:device_id, references(:devices, on_delete: :delete_all))
      modify(:label_id, references(:labels, on_delete: :delete_all))
    end
  end

  def down do
    execute "ALTER TABLE api_keys DROP CONSTRAINT api_keys_organization_id_fkey"
    alter table(:api_keys) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end

    execute "ALTER TABLE channels DROP CONSTRAINT channels_organization_id_fkey"
    alter table(:channels) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end

    execute "ALTER TABLE events DROP CONSTRAINT events_device_id_fkey"
    alter table(:events) do
      modify(:device_id, references(:devices, on_delete: :nothing))
    end

    execute "ALTER TABLE invitations DROP CONSTRAINT invitations_organization_id_fkey"
    alter table(:invitations) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end

    execute "ALTER TABLE labels DROP CONSTRAINT labels_organization_id_fkey"
    alter table(:labels) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end

    execute "ALTER TABLE memberships DROP CONSTRAINT memberships_organization_id_fkey"
    alter table(:memberships) do
      modify(:organization_id, references(:organizations, on_delete: :nothing))
    end

    execute "ALTER TABLE twofactors DROP CONSTRAINT twofactors_user_id_fkey"
    alter table(:twofactors) do
      modify(:user_id, references(:users, on_delete: :nothing))
    end

    execute "ALTER TABLE channels_labels DROP CONSTRAINT channels_labels_channel_id_fkey"
    execute "ALTER TABLE channels_labels DROP CONSTRAINT channels_labels_label_id_fkey"
    alter table(:channels_labels) do
      modify(:channel_id, references(:channels, on_delete: :nothing))
      modify(:label_id, references(:labels, on_delete: :nothing))
    end

    execute "ALTER TABLE devices_labels DROP CONSTRAINT devices_labels_device_id_fkey"
    execute "ALTER TABLE devices_labels DROP CONSTRAINT devices_labels_label_id_fkey"
    alter table(:devices_labels) do
      modify(:device_id, references(:devices, on_delete: :nothing))
      modify(:label_id, references(:labels, on_delete: :nothing))
    end
  end
end
