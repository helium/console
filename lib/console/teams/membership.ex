defmodule Console.Teams.Membership do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "memberships" do
    field :role, :string, default: "owner"
    belongs_to :user, Console.Auth.User
    belongs_to :team, Console.Teams.Team

    timestamps()
  end

  @doc false
  def changeset(membership, attrs) do
    membership
    |> cast(attrs, [:role, :user_id, :team_id])
    |> validate_required([:role, :user_id, :team_id])
  end

  def join_changeset(membership, user, team, role \\ "owner") do
    membership
    |> changeset(%{user_id: user.id, team_id: team.id, role: role})
  end
end
