defmodule ConsoleWeb.AlertController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Alerts
  alias Console.Alerts.Alert

  plug ConsoleWeb.Plug.AuthorizeAction when action not in [:accept]

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"alert" => alert_params}) do
    current_organization = conn.assigns.current_organization
    alert_params =
      Map.merge(alert_params, %{
        "organization_id" => current_organization.id
      })

    with {:ok, %Alert{} = alert} <- Alerts.create_alert(alert_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:alerts_index_table", "graphql:alerts_index_table:#{current_organization.id}:alert_list_update", %{})

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
      ConsoleWeb.Endpoint.broadcast("graphql:alerts_index_table", "graphql:alerts_index_table:#{current_organization.id}:alert_list_update", %{})

      conn
      |> put_resp_header("message", "#{alert.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end
end
