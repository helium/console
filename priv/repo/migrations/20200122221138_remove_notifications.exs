defmodule Console.Repo.Migrations.RemoveNotifications do
  use Ecto.Migration

  def change do
    drop table(:notification_views)
    drop table(:notifications)
  end
end
