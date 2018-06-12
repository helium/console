defmodule ConsoleWeb.NotificationController do
  use ConsoleWeb, :controller
  alias Console.Notifications
  alias Console.Notifications.Notification

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"notification" => params}) do
    current_team = conn.assigns.current_team

    with {:ok, notification = %Notification{}} <- Notifications.create_notification(current_team, params) do
      # broadcast(device, "new")
      # AuditTrails.create_audit_trail("device", "create", current_user, current_team, "devices", device)

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
      conn
      |> send_resp(:no_content, "")
    end
  end

  def update(conn, %{"id" => id, "notification" => params}) do
    current_membership = conn.assigns.current_membership
    notification = Notifications.get_notification!(current_membership, id)

    with {:ok, %Notification{} = notification} <- Notifications.mark_viewed(notification, current_membership) do
      conn
      |> send_resp(:no_content, "")
    end
  end
end
