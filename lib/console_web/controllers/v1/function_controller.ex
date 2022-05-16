defmodule ConsoleWeb.V1.FunctionController do
  use ConsoleWeb, :controller
  import Ecto.Query, warn: false

  alias Console.Organizations
  # alias Console.Flows
  alias Console.CommunityFunctions
  alias Console.Functions
  alias Console.Functions.Function

  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def index(conn, _params) do
    current_organization =
      conn.assigns.current_organization |> Organizations.fetch_assoc([:functions])

    functions =
      current_organization.functions
      |> Enum.map(fn func ->
        CommunityFunctions.inject_body(func)
      end)

    render(conn, "index.json", functions: functions)
  end

  def show(conn, %{ "id" => id }) do
    with {:ok, _id} <- Ecto.UUID.dump(id) do
      current_organization = conn.assigns.current_organization

      case Functions.get_function(current_organization, id) do
        nil ->
          {:error, :not_found, "Function not found"}
        %Function{} = function ->
          render(conn, "show.json", function: CommunityFunctions.inject_body(function))
      end
    else
      :error ->
        {:error, :bad_request, "id param must be a valid UUID"}
    end
  end

  # def create(conn, function_params = %{ "name" => _name }) do
  #   current_organization = conn.assigns.current_organization
  #   cond do
  #     Map.get(function_params, "format") not in ["cayenne", "browan_object_locator"] ->
  #       {:error, :bad_request, "Invalid function format, please check allowed function formats in Helium documentation"}
  #     true ->
  #       function_params = Map.merge(function_params, %{"organization_id" => current_organization.id, "type" => "decoder", "active" => true})
  #
  #       with {:ok, %Function{} = function} <- Functions.create_function(function_params, current_organization) do
  #         conn
  #         |> put_status(:created)
  #         |> render("show.json", function: function)
  #       end
  #   end
  # end

  # def update(conn, %{ "id" => id } = attrs) do
  #   with {:ok, _id} <- Ecto.UUID.dump(id) do
  #     current_organization = conn.assigns.current_organization

  #     case Functions.get_function(current_organization, id) do
  #       nil ->
  #         {:error, :not_found, "Function not found"}
  #       %Function{} = function ->
  #         function_attrs = Map.take(attrs, ["name", "active"])

  #         if length(Map.keys(function_attrs)) == 0 do
  #           {:error, :bad_request, "Only function name or active status can be updated"}
  #         else
  #           with {:ok, function} <- Functions.update_function(function, function_attrs) do
  #             affected_flows = Flows.get_flows_with_function_id(current_organization.id, function.id)
  #             all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)
  #             broadcast_router_update_devices(all_device_ids)

  #             render(conn, "show.json", function: function)
  #           end
  #         end
  #     end
  #   else
  #     :error ->
  #       {:error, :bad_request, "id param must be a valid UUID"}
  #   end
  # end
  #
  # def delete(conn, %{ "id" => id }) do
  #   with {:ok, _id} <- Ecto.UUID.dump(id) do
  #     current_organization = conn.assigns.current_organization

  #     case Functions.get_function(current_organization, id) do
  #       nil ->
  #         {:error, :not_found, "Function not found"}
  #       %Function{} = function ->
  #         with {:ok, _} <- Functions.delete_function(function) do
  #           affected_flows = Flows.get_flows_with_function_id(current_organization.id, function.id)
  #           all_device_ids = Flows.get_all_flows_associated_device_ids(affected_flows)
  #           broadcast_router_update_devices(all_device_ids)

  #           conn
  #           |> send_resp(:ok, "Function deleted")
  #         end
  #     end
  #   else
  #     :error ->
  #       {:error, :bad_request, "integration_id param must be a valid UUID"}
  #   end
  # end

  # defp broadcast_router_update_devices(device_ids) do
  #   ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  # end
end
