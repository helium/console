defmodule ConsoleWeb.AlertController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Alerts
  alias Console.Alerts.Alert

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"alert" => alert_params}) do
    current_organization = conn.assigns.current_organization
    alert_params =
      Map.merge(alert_params, %{
        "organization_id" => current_organization.id
      })

    with {:ok, %Alert{} = alert} <- Alerts.create_alert(alert_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Alert #{alert.name} added successfully")
      |> render("show.json", alert: alert)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    alert = Alerts.get_alert!(current_organization, id)

    with {:ok, %Alert{} = alert} <- Alerts.delete_alert(alert) do
      # ConsoleWeb.Endpoint.broadcast("graphql:device_index_labels_bar:#{current_organization.id}:label_list_update", %{})

      conn
      |> put_resp_header("message", "#{alert.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end
end
