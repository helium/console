defmodule Console.Repo.Migrations.AddLabelNotificationEventsTable do
  use Ecto.Migration

  def change do
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
  end
end
