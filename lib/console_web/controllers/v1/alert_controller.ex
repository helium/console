defmodule ConsoleWeb.V1.AlertController do
  use ConsoleWeb, :controller

  alias Console.Alerts
  alias Console.Alerts.Alert
  alias Console.Alerts.AlertNode
  alias Console.Organizations.Organization
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def create(conn, alert_params = %{"name" => _name, "config" => _config, "node_type" => _node_type}) do
    current_organization = conn.assigns.current_organization
    alert_params =
      Map.merge(alert_params, %{
        "organization_id" => current_organization.id,
      })
    
    with {:ok, %Alert{} = alert} <- Alerts.create_alert(alert_params) do
      broadcast_alerts_change(current_organization)
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
          broadcast_alerts_change(current_organization)
          broadcast_alert_show(alert)
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
          broadcast_alerts_change(current_organization)
          conn
          |> send_resp(:ok, "Alert deleted")
        end
    end
  end

  def add_alert_to_node(conn, %{ "alert_id" => alert_id, "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization
    alert_node = Alerts.get_alert_node(alert_id, node_id, node_type)

    if alert_node == nil do
      case Alerts.get_alert(current_organization, alert_id) do
        nil ->
          {:error, :not_found, "Alert not found"}
        %Alert{} = alert ->
          with {:ok, %AlertNode{} = alert_node} <- Alerts.add_alert_node(current_organization, alert, node_id, node_type) do
            broadcast_alert_settings(alert_node.node_id, alert_node.node_type)
            conn
            |> send_resp(:ok, "Alert was successfully added to the #{node_type} node")
        end
      end
    else
      {:error, :bad_request, "Alert already added to provided node"}
    end
  end

  def remove_alert_from_node(conn, %{ "alert_id" => alert_id, "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization
    alert = Alerts.get_alert(current_organization, alert_id)
    alert_node = Alerts.get_alert_node(alert_id, node_id, node_type)

    if alert != nil and alert_node != nil do
      with {:ok, %AlertNode{} = _deleted_alert_node} <- Alerts.remove_alert_node(current_organization, alert_node) do
        broadcast_alert_settings(alert_node.node_id, alert_node.node_type)
        conn
          |> send_resp(:ok, "Alert was successfully removed from the #{node_type} node")
      end
    else
      msg =
        case alert do
          nil -> "Alert not found"
          _ -> "Alert not attached to node"
        end
      {:error, :not_found, msg}
    end
  end

  defp broadcast_alerts_change(%Organization{} = organization) do
    ConsoleWeb.Endpoint.broadcast("graphql:alerts_index_table", "graphql:alerts_index_table:#{organization.id}:alert_list_update", %{})
  end

  defp broadcast_alert_show(%Alert{} = alert) do
    ConsoleWeb.Endpoint.broadcast("graphql:alert_show", "graphql:alert_show:#{alert.id}:alert_update", %{})
  end

  defp broadcast_alert_settings(node_id, node_type) do
    ConsoleWeb.Endpoint.broadcast("graphql:alert_settings_table", "graphql:alert_settings_table:#{node_type}-#{node_id}:alert_settings_update", %{})
  end
end
