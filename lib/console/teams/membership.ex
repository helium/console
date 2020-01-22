defmodule Console.Teams.Membership do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Console.Auth.User
  alias Console.Auth.TwoFactor

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "memberships" do
    field :role, :string, default: "admin"
    field :email, :string, virtual: true
    field :two_factor_enabled, :boolean, virtual: true
    belongs_to :user, Console.Auth.User
    belongs_to :organization, Console.Teams.Organization

    timestamps()
  end

  @doc false
  def changeset(membership, attrs) do
    membership
    |> cast(attrs, [:role, :user_id, :organization_id])
    |> validate_required([:role, :user_id, :organization_id])
    |> validate_inclusion(:role, ~w(admin manager))
    |> unique_constraint(:unique_member, name: :memberships_user_id_organization_id_index, message: "That email is already part of this organization")
  end

  def join_org_changeset(membership, user, organization, role \\ "admin") do
    membership
    |> changeset(%{user_id: user.id, organization_id: organization.id, role: role})
  end

  def user_twofactor(query) do
    from u in User,
    inner_join: m in ^query, on: [user_id: u.id],
    left_join: t in TwoFactor, on: [user_id: u.id],
    where: not is_nil(u.id),
    select: %{m | email: u.email, two_factor_enabled: not is_nil(t.id)}
  end
end
