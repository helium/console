defmodule ConsoleWeb.AlertController do
  use ConsoleWeb, :controller

  alias Console.Alerts
  alias Console.Alerts.Alert
  alias Console.Alerts.AlertNodes

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

  def update(conn, %{"id" => id, "alert" => alert_params}) do
    current_organization = conn.assigns.current_organization
    alert = Alerts.get_alert!(current_organization, id)
    name = alert.name

    with {:ok, %Alert{} = alert} <- Alerts.update_alert(alert, alert_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:alert_show", "graphql:alert_show:#{alert.id}:alert_update", %{})

      msg =
        cond do
          alert.name == name -> "Alert #{alert.name} updated successfully"
          true -> "The alert #{name} was successfully updated to #{alert.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", alert: alert)
    end
  end

  def add_alert_to_node(conn, %{ "alert_id" => alert_id, "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization
    alert = Alerts.get_alert!(current_organization, alert_id)

    with {:ok, %AlertNodes{} = alert_node} <- Alerts.add_alert_node(current_organization, alert, node_id, node_type) do
      ConsoleWeb.Endpoint.broadcast("graphql:alert_settings_table", "graphql:alert_settings_table:#{node_type}-#{node_id}:alert_settings_update", %{})
      
      msg =
        case alert_node do
          nil -> "Alert was already assigned to node"
          %AlertNodes{} -> "Alert was successfully added to the #{node_type} node"
        end

      conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
    end
  end

  def remove_alert_from_node(conn, %{ "alert_id" => alert_id, "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization
    Alerts.get_alert!(current_organization, alert_id)
    alert_node = Alerts.get_alert_node!(alert_id, node_id, node_type)

    with {:ok, %AlertNodes{} = deleted_alert_node} <- Alerts.remove_alert_node(current_organization, alert_node) do
      ConsoleWeb.Endpoint.broadcast("graphql:alert_settings_table", "graphql:alert_settings_table:#{node_type}-#{node_id}:alert_settings_update", %{})

      msg =
        case deleted_alert_node do
          nil -> "Alert not attached to provided node"
          %AlertNodes{} -> "Alert was successfully removed from the #{node_type} node"
        end

      conn
        |> put_resp_header("message", msg)
        |> send_resp(:no_content, "")
    end
  end
end
