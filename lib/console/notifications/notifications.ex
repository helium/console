defmodule Console.Notifications do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Notifications.Notification
  alias Console.Notifications.NotificationView
  alias Console.Teams.Team
  alias Console.Teams.Membership

  def get_notification!(%Team{} = team, id) do
    Ecto.assoc(team, :notifications) |> Repo.get!(id)
  end

  def create_notification(team = %Team{}, attrs \\ %{}) do
    %Notification{}
    |> Notification.changeset(team, attrs)
    |> Repo.insert()
  end

  def mark_viewed(notification = %Notification{}, membership = %Membership{}) do
    result = %NotificationView{}
             |> NotificationView.changeset(notification, membership)
             |> Repo.insert()

    case result do
      {:ok, _} -> :ok
      {:error, _} -> :ok # we might get a unique constraint error and that's ok
      _ -> :error
    end
  end

  def clear_all(membership = %Membership{}) do
    notifications = Ecto.assoc(membership, :notifications)
                    |> Notification.active(membership)
                    |> Repo.all()
    now = DateTime.utc_now()
    entries =
      for n <- notifications,
          do:
            %{
              "membership_id" => membership.id,
              "notification_id" => n.id,
              "inserted_at" => now,
              "updated_at" => now
            }
            |> Map.new(fn {k, v} -> {String.to_atom(k), v} end)

    Repo.insert_all(NotificationView, entries, on_conflict: :nothing)
    {:ok, notifications}
  end

  def update_notification(%Notification{} = notification, attrs \\ %{}) do
    notification
    |> Notification.changeset(attrs)
    |> Repo.update()
  end
end
