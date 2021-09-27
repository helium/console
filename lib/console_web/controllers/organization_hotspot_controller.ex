defmodule ConsoleWeb.OrganizationHotspotController do
  use ConsoleWeb, :controller

  alias Console.OrganizationHotspots

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
            |> put_resp_header("message", "Hotspot claimed successfully")
            |> send_resp(:ok, "")
          end
        else
          {:error, :not_found, "Hotspot doesn't seem to be claimed, please refresh the page and check again"}
        end
      _ ->
        if claimed do
          {:error, :bad_request, "Hotspot has already been claimed, please refresh the page and check again"}
        else
          with {:ok, _} <- OrganizationHotspots.delete_org_hotspot(org_hotspot) do
            ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})

            conn
            |> put_resp_header("message", "Hotspot removed from My Hotspots tab successfully")
            |> send_resp(:ok, "")
          end
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

  def update_organization_hotspots(conn, params = %{"hotspot_addresses" => hotspot_addresses, "claimed" => claimed}) do
    current_organization = conn.assigns.current_organization

    if length(hotspot_addresses) == 0 do
      {:error, :bad_request, "Please select at least one hotspot"}
    else
      if claimed do
        with {:ok, count, _organization_hotspots} <- OrganizationHotspots.claim_org_hotspots(hotspot_addresses, current_organization) do
          ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})
          conn
            |> put_resp_header("message", "Hotspots claimed successfully")
            |> send_resp(:ok, "")
        end
      else
        with {count, nil} <- OrganizationHotspots.unclaim_org_hotspots(hotspot_addresses, current_organization) do
          ConsoleWeb.Endpoint.broadcast("graphql:coverage_index_org_hotspots", "graphql:coverage_index_org_hotspots:#{current_organization.id}:org_hotspots_update", %{})
          conn
            |> put_resp_header("message", "Hotspots removed from My Hotspots tab successfully")
            |> send_resp(:ok, "")
        end
      end
    end
  end
end
