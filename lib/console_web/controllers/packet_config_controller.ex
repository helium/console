defmodule ConsoleWeb.PacketConfigController do
  use ConsoleWeb, :controller

  alias Console.PacketConfigs
  alias Console.Labels
  alias Console.Devices
  alias Console.Labels.Label
  alias Console.Devices.Device
  alias Console.PacketConfigs.PacketConfig

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"packet_config" => packet_config_params}) do
    current_organization = conn.assigns.current_organization
    packet_config_params =
      Map.merge(packet_config_params, %{
        "organization_id" => current_organization.id
      })

    with {:ok, %PacketConfig{} = packet_config} <- PacketConfigs.create_packet_config(packet_config_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:packet_configs_index_table", "graphql:packet_configs_index_table:#{current_organization.id}:packet_config_list_update", %{})

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Packet Config #{packet_config.name} added successfully")
      |> render("show.json", packet_config: packet_config)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    packet_config = PacketConfigs.get_packet_config!(current_organization, id)

    affected_device_ids = PacketConfigs.get_all_packet_config_associated_device_ids(id)

    with {:ok, %PacketConfig{} = packet_config} <- PacketConfigs.delete_packet_config(packet_config) do
      ConsoleWeb.Endpoint.broadcast("graphql:packet_configs_index_table", "graphql:packet_configs_index_table:#{current_organization.id}:packet_config_list_update", %{})
      broadcast_router_update_devices(affected_device_ids)

      conn
      |> put_resp_header("message", "#{packet_config.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def update(conn, %{"id" => id, "packet_config" => packet_config_params}) do
    current_organization = conn.assigns.current_organization
    packet_config = PacketConfigs.get_packet_config!(current_organization, id)

    affected_device_ids = PacketConfigs.get_all_packet_config_associated_device_ids(id)

    with {:ok, %PacketConfig{} = packet_config} <- PacketConfigs.update_packet_config(packet_config, packet_config_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:packet_config_show", "graphql:packet_config_show:#{packet_config.id}:packet_config_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:packet_configs_index_table", "graphql:packet_configs_index_table:#{current_organization.id}:packet_config_list_update", %{})
      broadcast_router_update_devices(affected_device_ids)

      conn
      |> put_resp_header("message", "Packet Config updated successfully")
      |> render("show.json", packet_config: packet_config)
    end
  end

  def add_packet_config_to_node(conn, %{ "packet_config_id" => packet_config_id, "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization
    PacketConfigs.get_packet_config!(current_organization, packet_config_id)

    case node_type do
      "Device" ->
        device = Devices.get_device!(current_organization, node_id)
        with {:ok, %Device{} = device} <- Devices.update_device(device, %{ "packet_config_id" => packet_config_id }) do
          ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
          broadcast_router_update_devices([device.id])

          conn
            |> put_resp_header("message", "Packet Config successfully added to Device")
            |> send_resp(:no_content, "")
        end
      "Label" ->
        label = Labels.get_label!(current_organization, node_id) |> Labels.fetch_assoc([:devices])
        device_ids = label.devices |> Enum.map(fn d -> d.id end)

        with {:ok, %Label{} = label} <- Labels.update_label(label, %{ "packet_config_id" => packet_config_id }) do
          ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})
          broadcast_router_update_devices(device_ids)

          conn
            |> put_resp_header("message", "Packet Config successfully added to Label")
            |> send_resp(:no_content, "")
        end
      _ ->
        conn |> send_resp(:bad_request, "")
    end
  end

  def remove_packet_config_from_node(conn, %{ "node_id" => node_id, "node_type" => node_type }) do
    current_organization = conn.assigns.current_organization

    case node_type do
      "Device" ->
        device = Devices.get_device!(current_organization, node_id)
        with {:ok, %Device{} = device} <- Devices.update_device(device, %{ "packet_config_id" => nil }) do
          ConsoleWeb.Endpoint.broadcast("graphql:device_show", "graphql:device_show:#{device.id}:device_update", %{})
          broadcast_router_update_devices([device.id])

          conn
            |> put_resp_header("message", "Packet Config successfully removed from Device")
            |> send_resp(:no_content, "")
        end
      "Label" ->
        label = Labels.get_label!(current_organization, node_id) |> Labels.fetch_assoc([:devices])
        device_ids = label.devices |> Enum.map(fn d -> d.id end)
        
        with {:ok, %Label{} = label} <- Labels.update_label(label, %{ "packet_config_id" => nil }) do
          ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})
          broadcast_router_update_devices(device_ids)

          conn
            |> put_resp_header("message", "Packet Config successfully removed from Label")
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
