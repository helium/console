defmodule Console.Repo.Migrations.RemoveUnusedTablesAndFields do
  use Ecto.Migration

  defmodule Console.Repo.Migrations.RemoveUnusedTablesColumns do
  use Ecto.Migration

    def up do
      drop table(:channels_labels)
      drop table(:label_notification_settings)
      drop table(:label_notification_webhooks)
      drop table(:label_notification_events)

      alter table(:labels) do
        remove :function_id
      end

      alter table(:labels) do
        remove :multi_buy
      end
    end
    
    def down do
      create table(:channels_labels) do
        add :channel_id, references(:channels)
        add :label_id, references(:labels)

        timestamps()
      end

      create unique_index(:channels_labels, [:channel_id, :label_id])
      execute "ALTER TABLE channels_labels DROP CONSTRAINT channels_labels_channel_id_fkey"
      execute "ALTER TABLE channels_labels DROP CONSTRAINT channels_labels_label_id_fkey"
      alter table(:channels_labels) do
        modify(:channel_id, references(:channels, on_delete: :delete_all))
        modify(:label_id, references(:labels, on_delete: :delete_all))
      end

      alter table(:labels) do
        add :function_id, references(:functions)
        add :multi_buy, :integer, null: false, default: 0
      end

      create table(:label_notification_settings, primary_key: false) do
        add :id, :binary_id, primary_key: true, null: false
        add :key, :string, null: false
        add :value, :string, null: false
        add :label_id, references(:labels, on_delete: :delete_all), null: false
        add :recipients, :string, null: false

        timestamps()
      end

      create index(:label_notification_settings, [:label_id])
      create unique_index(:label_notification_settings, [:key, :label_id])

      create table(:label_notification_webhooks, primary_key: false) do
        add :id, :binary_id, primary_key: true, null: false
        add :key, :string, null: false
        add :url, :string, null: false
        add :label_id, references(:labels, on_delete: :delete_all), null: false
        add :notes, :text, null: true
        add :value, :string, null: false

        timestamps()
      end

      create index(:label_notification_webhooks, [:label_id])
      create unique_index(:label_notification_webhooks, [:key, :label_id])

      create table(:label_notification_events, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :reported_at, :naive_datetime, null: false
      add :key, :string, null: false
      add :label_id, references(:labels, on_delete: :delete_all), null: false
      add :details, :map, default: %{}, null: false
      add :sent, :boolean, null: false, default: false

      timestamps()
    end

    create index(:label_notification_events, [:label_id])
    create index(:label_notification_events, [:reported_at])
    end
  end
end
