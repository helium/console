defmodule Console.Repo.Migrations.CreateNotifications do
  use Ecto.Migration

  def change do
    create table(:notifications) do
      add :team_id, references(:teams)
      add :title, :string, null: false
      add :body, :string
      add :url, :string
      add :category, :string

      timestamps()
    end

    create table(:notification_views) do
      add :notification_id, references(:notifications)
      add :membership_id, references(:memberships)

      timestamps()
    end

    create unique_index(:notification_views, [:notification_id, :membership_id])
  end
end
