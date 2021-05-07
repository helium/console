defmodule ConsoleWeb.V1.AlertController do
  use ConsoleWeb, :controller

  alias Console.Organizations
  alias Console.Alerts
  alias Console.Alerts.Alert
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def create(conn, alert_params = %{"name" => _name, "config" => _config, "node_type" => _node_type}) do
    current_organization = conn.assigns.current_organization
    alert_params =
      Map.merge(alert_params, %{
        "organization_id" => current_organization.id,
      })
    
    with {:ok, %Alert{} = alert} <- Alerts.create_alert(alert_params) do
      conn
      |> put_status(:created)
      |> render("show.json", alert: alert)
    end
  end

  def update(conn, %{"id" => id, "alert" => alert_params}) do
    current_organization = conn.assigns.current_organization
    case Alerts.get_alert(current_organization, id) do
      nil ->
        {:error, :not_found, "Alert not found"}
      %Alert{} = alert -> 
        with {:ok, %Alert{} = alert} <- Alerts.update_alert(alert, alert_params) do
          conn
          |> send_resp(:ok, "Alert updated")
        end
    end
  end

  def delete(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Alerts.get_alert(current_organization, id) do
      nil ->
        {:error, :not_found, "Alert not found"}
      %Alert{} = alert ->
        with {:ok, _} <- Alerts.delete_alert(alert) do
          conn
          |> send_resp(:ok, "Alert deleted")
        end
    end
  end
end
