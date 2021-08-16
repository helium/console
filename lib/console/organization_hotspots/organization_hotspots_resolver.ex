defmodule Console.OrganizationHotspots.OrganizationHotspotsResolver do
  alias Console.OrganizationHotspots

  def all(_, %{context: %{current_organization: current_organization}}) do
    all_org_hotspots = OrganizationHotspots.all(current_organization)

    {:ok, all_org_hotspots}
  end
end
