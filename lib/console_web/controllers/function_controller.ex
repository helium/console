defmodule ConsoleWeb.FunctionController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Functions
  alias Console.Functions.Function
  alias Console.Labels

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"function" => function_params}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    function_params = Map.merge(function_params, %{"organization_id" => current_organization.id})

    with {:ok, %Function{} = function} <- Functions.create_function(function_params, current_organization) do
      broadcast(function)

      case function_params["labels"]["labelsApplied"] do
        nil -> nil
        labels -> Labels.add_function_to_labels(function, labels, current_organization)
      end

      case function_params["labels"]["newLabels"] do
        nil -> nil
        labels -> Labels.create_labels_add_function(function, labels, current_organization, current_user)
      end

      broadcast_router_update_devices(function)

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
      broadcast(function)
      broadcast(function, function.id)
      broadcast_router_update_devices(function)

      conn
      |> put_resp_header("message", "Function #{function.name} updated successfully")
      |> render("show.json", function: function)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    function = Functions.get_function!(current_organization, id) |> Functions.fetch_assoc([labels: :devices])

    with {:ok, _} <- Functions.delete_function(function) do
      broadcast(function)
      broadcast_router_update_devices(function.labels)

      conn
      |> put_resp_header("message", "#{function.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def broadcast(%Function{} = function) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, function, function_added: "#{function.organization_id}/function_added")
  end

  def broadcast(%Function{} = function, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, function, function_updated: "#{function.organization_id}/#{id}/function_updated")
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
