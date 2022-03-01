defmodule ConsoleWeb.V1.FunctionController do
  use ConsoleWeb, :controller
  import Ecto.Query, warn: false

  alias Console.Organizations
  alias Console.Flows
  alias Console.Functions
  alias Console.Functions.Function
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:functions])

    render(conn, "index.json", functions: current_organization.functions)
  end

  def show(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Functions.get_function(current_organization, id) do
      nil ->
        {:error, :not_found, "Function not found"}
      %Function{} = function ->
        render(conn, "show.json", function: function)
    end
  end

  def create(conn, function_params = %{ "name" => _name }) do
    current_organization = conn.assigns.current_organization
    function_params = Map.merge(function_params, %{"organization_id" => current_organization.id, "type" => "decoder", "active" => true})

    with {:ok, %Function{} = function} <- Functions.create_function(function_params, current_organization) do
      conn
      |> put_status(:created)
      |> render("show.json", function: function)
    end
  end

  def update(conn, %{ "id" => id } = attrs) do
    current_organization = conn.assigns.current_organization

    case Functions.get_function(current_organization, id) do
      nil ->
        {:error, :not_found, "Function not found"}
      %Function{} = function ->
        function_attrs = Map.take(attrs, ["name", "active", "body"])

        if length(Map.keys(function_attrs)) == 0 do
          {:error, :bad_request, "Function update attributes must contain name, active, or body"}
        else
          with {:ok, function} <- Functions.update_function(function, function_attrs) do
            affected_flows = Flows.get_flows_with_function_id(current_organization.id, function.id)
            all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)
            broadcast_router_update_devices(all_device_ids)

            render(conn, "show.json", function: function)
          end
        end
    end
  end

  def delete(conn, %{ "id" => id }) do
    current_organization = conn.assigns.current_organization

    case Functions.get_function(current_organization, id) do
      nil ->
        {:error, :not_found, "Function not found"}
      %Function{} = function ->
        with {:ok, _} <- Functions.delete_function(function) do
          affected_flows = Flows.get_flows_with_function_id(current_organization.id, function.id)
          all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)
          broadcast_router_update_devices(all_device_ids)

          conn
          |> send_resp(:ok, "Function deleted")
        end
    end
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
