defmodule ConsoleWeb.NotificationController do
  use ConsoleWeb, :controller
  alias Console.Notifications
  alias Console.Notifications.Notification

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"notification" => params}) do
    current_team = conn.assigns.current_team

    with {:ok, notification = %Notification{}} <- Notifications.create_notification(current_team, params) do
      broadcast(notification, "new")

      conn
      |> put_status(:created)
      |> send_resp(:no_content, "")
    end
  end

  def view(conn, %{"notification_id" => id}) do
    current_team = conn.assigns.current_team
    current_membership = conn.assigns.current_membership
    notification = Notifications.get_notification!(current_team, id)

    with :ok <- Notifications.mark_viewed(notification, current_membership) do
      broadcast(notification, "update")

      conn
      |> send_resp(:no_content, "")
    end
  end

  def clear(conn, _params) do
    current_membership = conn.assigns.current_membership

    with {:ok, notifications} <- Notifications.clear_all(current_membership) do
      # just broadcast one of the notifications to trigger the query reload
      notification = List.last(notifications)
      if notification, do: broadcast(notification, "update")

      conn
      |> send_resp(:no_content, "")
    end
  end

  defp broadcast(%Notification{} = notification, action) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, notification, notification_update: "#{notification.team_id}/notification_update")
  end
end
