defmodule Console.Notifications.Notification do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Console.Teams.Team
  alias Console.Teams.Membership
  alias Console.Notifications.NotificationView

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "notifications" do
    field :title, :string
    field :body, :string
    field :url, :string
    field :category, :string
    field :active, :boolean, virtual: true
    belongs_to :team, Console.Teams.Team
    has_many :notification_views, NotificationView

    timestamps()
  end

  @doc false
  def changeset(notification, attrs) do
    notification
    |> cast(attrs, [:title, :body, :url, :category, :team_id])
    |> validate_required(:title, message: "Title is required")
  end

  def changeset(notification, team = %Team{}, attrs) do
    notification
    |> changeset(Map.merge(attrs, %{"team_id" => team.id}))
  end

  def active(query, membership = %Membership{}) do
    from n in query,
    left_join: nv in NotificationView, on: [notification_id: n.id, membership_id: ^membership.id],
    where: is_nil(nv.id)
  end

  def with_active(query, membership = %Membership{}) do
    from n in query,
    left_join: nv in NotificationView, on: [notification_id: n.id, membership_id: ^membership.id],
    select: %{n | active: is_nil(nv.id)}
  end
end
