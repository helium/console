defmodule Console.Organizations.Organization do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "organizations" do
    field :name, :string

    has_many :channels, Console.Channels.Channel, on_delete: :delete_all
    has_many :devices, Console.Devices.Device, on_delete: :delete_all
    has_many :labels, Console.Labels.Label, on_delete: :delete_all
    has_many :memberships, Console.Organizations.Membership, on_delete: :delete_all
    many_to_many :users, Console.Auth.User, join_through: "memberships"
    has_many :invitations, Console.Organizations.Invitation, on_delete: :delete_all
    has_many :api_keys, Console.ApiKeys.ApiKey, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(organization, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

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
