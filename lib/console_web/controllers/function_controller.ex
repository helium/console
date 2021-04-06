defmodule ConsoleWeb.FunctionController do
  use ConsoleWeb, :controller

  alias Console.Functions
  alias Console.Functions.Function

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"function" => function_params}) do
    current_organization = conn.assigns.current_organization
    function_params = Map.merge(function_params, %{"organization_id" => current_organization.id})

    with {:ok, %Function{} = function} <- Functions.create_function(function_params, current_organization) do
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_table", "graphql:function_index_table:#{current_organization.id}:function_list_update", %{})

      conn
        |> put_status(:created)
        |> put_resp_header("message",  "Function #{function.name} added successfully")
        |> render("show.json", function: function)
    end
  end

  def update(conn, %{"id" => id, "function" => function_params}) do
    current_organization = conn.assigns.current_organization
    function = Functions.get_function!(current_organization, id)

    with {:ok, %Function{} = function} <- Functions.update_function(function, function_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_table", "graphql:function_index_table:#{current_organization.id}:function_list_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:function_show", "graphql:function_show:#{function.id}:function_update", %{})

      conn
      |> put_resp_header("message", "Function #{function.name} updated successfully")
      |> render("show.json", function: function)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    function = Functions.get_function!(current_organization, id)

    with {:ok, _} <- Functions.delete_function(function) do
      ConsoleWeb.Endpoint.broadcast("graphql:function_index_table", "graphql:function_index_table:#{current_organization.id}:function_list_update", %{})

      conn
      |> put_resp_header("message", "#{function.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  defp broadcast_router_update_devices(%Function{} = function) do
    assoc_labels = function |> Functions.fetch_assoc([labels: :devices]) |> Map.get(:labels)
    assoc_device_ids = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end

  defp broadcast_router_update_devices(assoc_labels) do
    assoc_device_ids = Enum.map(assoc_labels, fn l -> l.devices end) |> List.flatten() |> Enum.uniq() |> Enum.map(fn d -> d.id end)
    if length(assoc_device_ids) > 0 do
      ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => assoc_device_ids })
    end
  end
end
