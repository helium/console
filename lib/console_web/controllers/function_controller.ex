defmodule ConsoleWeb.FunctionController do
  use ConsoleWeb, :controller

  alias Console.Functions
  alias Console.Functions.Function
  alias Console.Alerts
  alias Console.Flows

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"function" => function_params}) do
    current_organization = conn.assigns.current_organization
    function_params = Map.merge(function_params, %{"organization_id" => current_organization.id})

    with {:ok, %Function{} = function} <- Functions.create_function(function_params, current_organization) do
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_table", "graphql:function_index_table:#{current_organization.id}:function_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_bar", "graphql:function_index_bar:#{current_organization.id}:function_list_update", %{})

      conn
        |> put_status(:created)
        |> put_resp_header("message",  "Function #{function.name} added successfully")
        |> render("show.json", function: function)
    end
  end

  def update(conn, %{"id" => id, "function" => function_params}) do
    current_organization = conn.assigns.current_organization
    function = Functions.get_function!(current_organization, id)

    affected_flows = Flows.get_flows_with_function_id(current_organization.id, function.id)
    all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)

    with {:ok, %Function{} = function} <- Functions.update_function(function, function_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_table", "graphql:function_index_table:#{current_organization.id}:function_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_bar", "graphql:function_index_bar:#{current_organization.id}:function_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:function_show", "graphql:function_show:#{function.id}:function_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:resources_update", "graphql:resources_update:#{current_organization.id}:organization_resources_update", %{})
      broadcast_router_update_devices(all_device_ids)

      conn
      |> put_resp_header("message", "Function #{function.name} updated successfully")
      |> render("show.json", function: function)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    function = Functions.get_function!(current_organization, id)

    affected_flows = Flows.get_flows_with_function_id(current_organization.id, function.id)
    all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)

    with {:ok, _} <- Functions.delete_function(function) do
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_table", "graphql:function_index_table:#{current_organization.id}:function_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_bar", "graphql:function_index_bar:#{current_organization.id}:function_list_update", %{})
      Alerts.delete_alert_nodes(id, "function")
      broadcast_router_update_devices(all_device_ids)

      conn
      |> put_resp_header("message", "#{function.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
