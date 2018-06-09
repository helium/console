defmodule Console.Repo.Migrations.CreateNotifications do
  use Ecto.Migration

  def change do
    create table(:notifications) do
      add :membership_id, references(:memberships)
      add :title, :string, null: false
      add :body, :string
      add :active, :boolean, null: false, default: true
      add :url, :string
      add :category, :string

      timestamps()
    end

    create index(:notifications, [:active])
  end
end
