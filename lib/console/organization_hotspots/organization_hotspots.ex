defmodule Console.OrganizationHotspots do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.OrganizationHotspots.OrganizationHotspot

  def create_hotspot(attrs \\ %{}) do
    %OrganizationHotspot{}
    |> OrganizationHotspot.changeset(attrs)
    |> Repo.insert()
  end

  def update_hotspot(%OrganizationHotspot{} = org_hotspot, attrs) do
    org_hotspot
    |> OrganizationHotspot.changeset(attrs)
    |> Repo.update()
  end
end
