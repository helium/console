defmodule ConsoleWeb.OrganizationHotspotController do
  use ConsoleWeb, :controller

  alias Console.OrganizationHotspots
  alias Console.OrganizationHotspots.OrganizationHotspot

  plug ConsoleWeb.Plug.AuthorizeAction
  action_fallback ConsoleWeb.FallbackController

  def update_organization_hotspot(conn, params = %{"hotspot_address" => hotspot_address, "claimed" => claimed}) do
    current_organization = conn.assigns.current_organization
    attrs = Map.merge(params, %{"organization_id" => current_organization.id})

    case claimed do
      true ->
        with {:ok, _} <- OrganizationHotspots.create_org_hotspot(attrs) do
          conn
          |> put_resp_header("message", "Hotspot claimed successfully")
          |> send_resp(:ok, "")
        end
      false ->
        case OrganizationHotspots.get_org_hotspot(hotspot_address, current_organization) do
          %OrganizationHotspot{} = org_hotspot ->
            with {:ok, _} <- OrganizationHotspots.delete_org_hotspot(org_hotspot) do
              conn
              |> put_resp_header("message", "Hotspot removed from My Hotspots tab successfully")
              |> send_resp(:ok, "")
            end
          _ ->
            {:error, :not_found, "Hotspot doesn't seem to be claimed, please refresh the page and check again"}
        end
    end
  end
end
