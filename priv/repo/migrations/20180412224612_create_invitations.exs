defmodule Console.Repo.Migrations.CreateInvitations do
  use Ecto.Migration

  def change do
    create table("invitations") do
      add :email, :string, null: false
      add :role, :string, null: false
      add :token, :string, null: false
      add :pending, :boolean, null: false, default: true
      add :team_id, references(:teams)
      add :inviter_id, references(:users)

      timestamps()
    end

    create unique_index(:invitations, [:email, :team_id], name: :invitations_email_team_id_index)
    create unique_index(:invitations, :token)

  end
end
