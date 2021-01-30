defmodule Console.Repo.Migrations.AddWebhookTable do
  use Ecto.Migration

  def change do
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
  end
end
