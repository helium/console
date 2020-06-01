defmodule Console.Organizations.Membership do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Console.Auth.User
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "memberships" do
    field :role, :string, default: "read"
    field :email, :string
    field :two_factor_enabled, :boolean, virtual: true
    field :user_id, :string
    belongs_to :organization, Console.Organizations.Organization

    timestamps()
  end

  @doc false
  def changeset(membership, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["role"])

    membership
    |> cast(attrs, [:role, :user_id, :organization_id, :email])
    |> validate_required([:role, :user_id, :organization_id])
    |> validate_inclusion(:role, ~w(admin read))
    |> unique_constraint(:unique_member, name: :memberships_user_id_organization_id_index, message: "That email is already part of this organization")
  end

  def join_org_changeset(membership, user, organization, role) do
    membership
    |> changeset(%{user_id: user.id, organization_id: organization.id, role: role, email: user.email})
  end

end
