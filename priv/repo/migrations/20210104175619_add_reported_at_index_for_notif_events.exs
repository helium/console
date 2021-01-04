defmodule Console.Repo.Migrations.AddReportedAtIndexForNotifEvents do
  use Ecto.Migration

  def change do
    create index(:label_notification_events, [:reported_at])
  end
end