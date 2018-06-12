defmodule Console.Notifications.NotificationView do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Teams.Membership
  alias Console.Notifications.Notification

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "notification_views" do
    belongs_to :notification, Console.Notifications.Notification
    belongs_to :membership, Console.Teams.Membership

    timestamps()
  end

  @doc false
  def changeset(notification_view, notification = %Notification{}, membership = %Membership{}) do
    attrs = %{"notification_id" => notification.id, "membership_id" => membership.id}

    notification_view
    |> cast(attrs, [:notification_id, :membership_id])
    |> validate_required([:notification_id, :membership_id])
    |> unique_constraint(:unique_view, name: :notification_views_notification_id_membership_id_index, message: "Notification already viewed")
  end
end
