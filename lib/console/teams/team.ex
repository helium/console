defmodule Console.Teams.Team do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "teams" do
    field :name, :string
    has_many :memberships, Console.Teams.Membership
    many_to_many :users, Console.Auth.User, join_through: "memberships"
    has_many :invitations, Console.Teams.Invitation

    has_many :devices, Console.Devices.Device
    has_many :gateways, Console.Gateways.Gateway
    has_many :channels, Console.Channels.Channel
    has_many :audit_trails, Console.AuditTrails.AuditTrail
    has_many :notifications, Console.Notifications.Notification

    timestamps()
  end

  @doc false
  def changeset(team, attrs) do
    team
    |> cast(attrs, [:name])
    |> validate_required(:name, message: "Team Name is required")
    |> validate_length(:name, min: 3, message: "Team Name must be at least 3 letters")
  end

  @doc false
  def user_join_changeset(team, user, attrs) do
    team
    |> changeset(attrs)
    |> put_assoc(:users, [user])
  end

end
