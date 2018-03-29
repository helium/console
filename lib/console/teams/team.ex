defmodule Console.Teams.Team do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "teams" do
    field :name, :string
    has_many :memberships, Console.Teams.Membership
    many_to_many :users, Console.Auth.User, join_through: "memberships"

    timestamps()
  end

  @doc false
  def changeset(team, attrs) do
    team
    |> cast(attrs, [:name])
    |> validate_required([:name])
  end

  @doc false
  def user_join_changeset(team, user, attrs) do
    team
    |> changeset(attrs)
    |> put_assoc(:users, [user])
  end

end
