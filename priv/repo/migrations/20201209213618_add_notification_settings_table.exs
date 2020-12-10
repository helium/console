defmodule Console.Repo.Migrations.AddNotificationSettingsTable do
  use Ecto.Migration

  def change do
    create table(:label_notification_settings, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :key, :string
      add :value, :string
      add :label_id, references(:labels, on_delete: :delete_all), null: false
      add :recipients, :string
    end

    create index(:label_notification_settings, [:label_id])
    create unique_index(:label_notification_settings, [:key, :label_id])
  end
end
