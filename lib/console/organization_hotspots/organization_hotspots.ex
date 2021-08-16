defmodule Console.OrganizationHotspots do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.OrganizationHotspots.OrganizationHotspot

  def all(organization) do
    OrganizationHotspot
    |> where([oh], oh.organization_id == ^organization.id)
    |> Repo.all()
  end

  def get_org_hotspot(hotspot_address, organization) do
    Repo.get_by(OrganizationHotspot, [hotspot_address: hotspot_address, organization_id: organization.id])
  end

  def create_org_hotspot(attrs \\ %{}) do
    %OrganizationHotspot{}
    |> OrganizationHotspot.changeset(attrs)
    |> Repo.insert()
  end

  def update_org_hotspot(%OrganizationHotspot{} = org_hotspot, attrs) do
    org_hotspot
    |> OrganizationHotspot.changeset(attrs)
    |> Repo.update()
  end

  def delete_org_hotspot(%OrganizationHotspot{} = org_hotspot) do
    Repo.delete(org_hotspot)
  end
end
