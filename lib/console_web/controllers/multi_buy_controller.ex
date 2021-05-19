defmodule ConsoleWeb.MultiBuyController do
  use ConsoleWeb, :controller

  alias Console.MultiBuys
  alias Console.Labels
  alias Console.Devices
  alias Console.Labels.Label
  alias Console.Devices.Device
  alias Console.MultiBuys.MultiBuy

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"multi_buy" => multi_buy_params}) do
    current_organization = conn.assigns.current_organization
    multi_buy_params =
      Map.merge(multi_buy_params, %{
        "organization_id" => current_organization.id
      })

    with {:ok, %MultiBuy{} = multi_buy} <- MultiBuys.create_multi_buy(multi_buy_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:multi_buys_index_table", "graphql:multi_buys_index_table:#{current_organization.id}:multi_buy_list_update", %{})

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Multi Buy #{multi_buy.name} added successfully")
      |> render("show.json", multi_buy: multi_buy)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    multi_buy = MultiBuys.get_multi_buy!(current_organization, id)

    affected_device_ids = MultiBuys.get_all_multi_buy_associated_device_ids(id)

    with {:ok, %MultiBuy{} = multi_buy} <- MultiBuys.delete_multi_buy(multi_buy) do
      ConsoleWeb.Endpoint.broadcast("graphql:multi_buys_index_table", "graphql:multi_buys_index_table:#{current_organization.id}:multi_buy_list_update", %{})
      broadcast_router_update_devices(affected_device_ids)

      conn
      |> put_resp_header("message", "#{multi_buy.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def update(conn, %{"id" => id, "multi_buy" => multi_buy_params}) do
    current_organization = conn.assigns.current_organization
    multi_buy = MultiBuys.get_multi_buy!(current_organization, id)
    name = multi_buy.name

    affected_device_ids = MultiBuys.get_all_multi_buy_associated_device_ids(id)

    with {:ok, %MultiBuy{} = multi_buy} <- MultiBuys.update_multi_buy(multi_buy, multi_buy_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:multi_buy_show", "graphql:multi_buy_show:#{multi_buy.id}:multi_buy_update", %{})
      broadcast_router_update_devices(affected_device_ids)

      msg =
        cond do
          multi_buy.name == name -> "Multiple Packet purchase value updated successfully"
          true -> "Multiple Packet #{name} was successfully updated to #{multi_buy.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", multi_buy: multi_buy)
    end
  end

  def add_multi_buy_to_node(conn, %{ "multi_buy_id" => multi_buy_id, "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization
    MultiBuys.get_multi_buy!(current_organization, multi_buy_id)

    case node_type do
      "Device" ->
        device = Devices.get_device!(current_organization, node_id)
        with {:ok, %Device{} = device} <- Devices.update_device(device, %{ "multi_buy_id" => multi_buy_id }) do
          ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
          broadcast_router_update_devices([device.id])

          conn
            |> put_resp_header("message", "Multiple packet config successfully added to device")
            |> send_resp(:no_content, "")
        end
      "Label" ->
        label = Labels.get_label!(current_organization, node_id) |> Labels.fetch_assoc([:devices])
        device_ids = label.devices |> Enum.map(fn d -> d.id end)

        with {:ok, %Label{} = label} <- Labels.update_label(label, %{ "multi_buy_id" => multi_buy_id }) do
          ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})
          broadcast_router_update_devices(device_ids)

          conn
            |> put_resp_header("message", "Multiple packet config successfully added to label")
            |> send_resp(:no_content, "")
        end
      _ ->
        conn |> send_resp(:bad_request, "")
    end
  end

  def remove_multi_buy_from_node(conn, %{ "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization

    case node_type do
      "Device" ->
        device = Devices.get_device!(current_organization, node_id)
        with {:ok, %Device{} = device} <- Devices.update_device(device, %{ "multi_buy_id" => nil }) do
          ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
          broadcast_router_update_devices([device.id])

          conn
            |> put_resp_header("message", "Multiple packet config successfully removed from device")
            |> send_resp(:no_content, "")
        end
      "Label" ->
        label = Labels.get_label!(current_organization, node_id) |> Labels.fetch_assoc([:devices])
        device_ids = label.devices |> Enum.map(fn d -> d.id end)
        
        with {:ok, %Label{} = label} <- Labels.update_label(label, %{ "multi_buy_id" => nil }) do
          ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})
          broadcast_router_update_devices(device_ids)

          conn
            |> put_resp_header("message", "Multiple packet config successfully removed from label")
            |> send_resp(:no_content, "")
        end
      _ ->
        conn |> send_resp(:bad_request, "")
    end
  end

  defp broadcast_router_update_devices(device_ids) do
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
