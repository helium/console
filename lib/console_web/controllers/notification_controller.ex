defmodule ConsoleWeb.NotificationController do
  use ConsoleWeb, :controller
  alias Console.Notifications

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"notification" => params}) do
    current_team = conn.assigns.current_team

    with {_count, _} <- Notifications.create_notifications(current_team, params) do
      # broadcast(device, "new")
      # AuditTrails.create_audit_trail("device", "create", current_user, current_team, "devices", device)

      conn
      |> put_status(:created)
      |> send_resp(:no_content, "")
    end
  end
end
