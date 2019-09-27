defmodule Console.Teams.Organization do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "organizations" do
    field :name, :string

    has_many :memberships, Console.Teams.Membership, on_delete: :delete_all
    many_to_many :users, Console.Auth.User, join_through: "memberships"
    has_many :invitations, Console.Teams.Invitation, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(organization, attrs) do
    organization
    |> cast(attrs, [:name])
    |> validate_required(:name, message: "Organization Name is required")
    |> validate_length(:name, min: 3, message: "Organization Name must be at least 3 letters")
  end

  @doc false
  def create_changeset(organization, attrs) do
    organization
    |> changeset(attrs)
  end

  @doc false
  def user_join_changeset(organization, user, attrs) do
    organization
    |> changeset(attrs)
    |> put_assoc(:users, [user])
  end
end
