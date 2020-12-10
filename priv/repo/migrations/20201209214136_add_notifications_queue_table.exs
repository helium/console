defmodule Console.Repo.Migrations.AddNotificationsQueueTable do
  use Ecto.Migration

  def change do
    create table(:label_notification_queue, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :reported_at, :naive_datetime, null: false
      add :key, :string
      add :label_id, references(:labels, on_delete: :delete_all), null: false
      add :details, :map, default: %{}
      add :sent, :boolean, null: false, default: false

      timestamps()
    end

    create index(:label_notification_queue, [:label_id])
  end
end
