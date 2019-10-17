defmodule Console.Repo.Migrations.RemoveMemberInviteTeamIndex do
  use Ecto.Migration

  def change do
    create index(:memberships, [:user_id, :organization_id], unique: true)
    create index(:invitations, [:email, :organization_id], unique: true)
  end
end
