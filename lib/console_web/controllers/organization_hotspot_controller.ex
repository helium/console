defmodule ConsoleWeb.OrganizationHotspotController do
  use ConsoleWeb, :controller

  alias Console.OrganizationHotspots
  alias Console.PacketConfigs

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback ConsoleWeb.FallbackController

  def update_organization_hotspot(conn, params = %{"hotspot_address" => hotspot_address, "claimed" => claimed}) do
    current_organization = conn.assigns.current_organization
    attrs = Map.merge(params, %{"organization_id" => current_organization.id})

    org_hotspot = OrganizationHotspots.get_org_hotspot(hotspot_address, current_organization)

    case org_hotspot do
      nil ->
        if claimed do
          with {:ok, _} <- OrganizationHotspots.create_org_hotspot(attrs) do
            ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})

            conn
            |> put_resp_header("message", "Hotspot followed successfully")
            |> send_resp(:ok, "")
          end
        else
          {:error, :not_found, "Hotspot doesn't seem to be followed, please refresh the page and check again"}
        end
      _ ->
        if claimed do
          {:error, :bad_request, "Hotspot has already been followed, please refresh the page and check again"}
        else
          with {:ok, {hotspot_groups_count, nil}} <- OrganizationHotspots.unclaim_org_hotspot(org_hotspot, hotspot_address, current_organization) do
            ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})
            broadcast_router_devices_with_preferred_hotspots(current_organization)

            preferred_hotspots = OrganizationHotspots.all_preferred(current_organization)
            if length(preferred_hotspots) == 0 do
              PacketConfigs.turn_off_preferred_active_for_all(current_organization)
            end

            msg = cond do
              hotspot_groups_count > 0 -> "Hotspot removed from My Hotspots tab and Hotspot Groups successfully"
              true -> "Hotspot removed from My Hotspots tab successfully"
            end

            conn
            |> put_resp_header("message", msg)
            |> send_resp(:ok, "")
          end
        end
    end
  end
  
  def update_organization_hotspot(conn, %{"hotspot_address" => hotspot_address, "preferred" => preferred}) do
    current_organization = conn.assigns.current_organization

    org_hotspot = OrganizationHotspots.get_org_hotspot(hotspot_address, current_organization)

    case org_hotspot do
      nil ->
        {:error, :bad_request, "Hotspot must be followed before you can prefer it"}
      _ ->
        with {:ok, _} <- OrganizationHotspots.update_org_hotspot(org_hotspot, %{ "preferred" => preferred }) do
          ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})
          broadcast_router_devices_with_preferred_hotspots(current_organization)

          conn
          |> put_resp_header("message", "Hotspot preferred successfully")
          |> send_resp(:ok, "")
        end
    end
  end

  def update_organization_hotspot(conn, params = %{"hotspot_address" => hotspot_address, "alias" => alias}) do
    current_organization = conn.assigns.current_organization
    attrs = Map.merge(params, %{"organization_id" => current_organization.id, "claimed" => true})

    org_hotspot = OrganizationHotspots.get_org_hotspot(hotspot_address, current_organization)

    case org_hotspot do
      nil ->
        if alias == "" do
          {:error, :bad_request, "Hotspot doesn't have an existing alias, please refresh the page and check again"}
        else
          with {:ok, _} <- OrganizationHotspots.create_org_hotspot(attrs) do
            ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})

            conn
            |> put_resp_header("message", "Hotspot Alias added successfully")
            |> send_resp(:ok, "")
          end
        end
      _ ->
        if alias == "" do
          with {:ok, _} <- OrganizationHotspots.update_org_hotspot(org_hotspot, %{ "alias" => nil }) do
            ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})

            conn
            |> put_resp_header("message", "Hotspot Alias removed successfully")
            |> send_resp(:ok, "")
          end
        else
          with {:ok, _} <- OrganizationHotspots.update_org_hotspot(org_hotspot, %{ "alias" => alias }) do
            ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})

            conn
            |> put_resp_header("message", "Hotspot Alias updated successfully")
            |> send_resp(:ok, "")
          end
        end
    end
  end

  def update_organization_hotspots(conn, %{"hotspot_addresses" => hotspot_addresses, "claimed" => claimed}) do
    current_organization = conn.assigns.current_organization

    if length(hotspot_addresses) == 0 do
      {:error, :bad_request, "Please select at least one hotspot"}
    else
      if claimed do
        with {:ok, _, _} <- OrganizationHotspots.claim_org_hotspots(hotspot_addresses, current_organization) do
          ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})
          conn
            |> put_resp_header("message", "Hotspots followed successfully")
            |> send_resp(:ok, "")
        end
      else
        with {:ok, {hotspot_groups_count, nil}} <- OrganizationHotspots.unclaim_org_hotspots(hotspot_addresses, current_organization) do
          ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})
          broadcast_router_devices_with_preferred_hotspots(current_organization)
          
          preferred_hotspots = OrganizationHotspots.all_preferred(current_organization)
          if length(preferred_hotspots) == 0 do
            PacketConfigs.turn_off_preferred_active_for_all(current_organization)
          end
          
          msg = cond do
            hotspot_groups_count > 0 -> "Hotspots removed from My Hotspots tab and Hotspot Groups successfully"
            true -> "Hotspots removed from My Hotspots tab successfully"
          end
          conn
            |> put_resp_header("message", msg)
            |> send_resp(:ok, "")
        end
      end
    end
  end

  def update_organization_hotspots(conn, %{"hotspot_addresses" => hotspot_addresses, "preferred" => _preferred}) do
    current_organization = conn.assigns.current_organization

    if length(hotspot_addresses) == 0 do
      {:error, :bad_request, "Please select at least one hotspot"}
    else
      with {:ok, _count, _org_hotspots} <- OrganizationHotspots.prefer_hotspots(hotspot_addresses, current_organization) do
        ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})
        conn
          |> put_resp_header("message", "Hotspots preferred successfully")
          |> send_resp(:ok, "")
      end
    end
  end

  defp broadcast_router_devices_with_preferred_hotspots(organization) do
    device_ids = PacketConfigs.get_device_ids_associated_with_preferred_active_packet_configs(organization)
    ConsoleWeb.Endpoint.broadcast("device:all", "device:all:refetch:devices", %{ "devices" => device_ids })
  end
end
