defmodule Console.OrganizationHotspots do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.OrganizationHotspots.OrganizationHotspot
  alias Console.Groups

  def all(organization) do
    OrganizationHotspot
    |> where([oh], oh.organization_id == ^organization.id)
    |> Repo.all()
  end

  def all_claimed(organization) do
    OrganizationHotspot
    |> where([oh], oh.organization_id == ^organization.id and oh.claimed == true)
    |> Repo.all()
  end

  def all_preferred(organization) do
    OrganizationHotspot
    |> where([oh], oh.organization_id == ^organization.id and oh.preferred == true)
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

  def claim_org_hotspots(hotspot_addresses, organization) do
    existing_org_hotspots =
      OrganizationHotspot
      |> where([oh], oh.hotspot_address in ^hotspot_addresses and oh.organization_id == ^organization.id)
      |> Repo.all()
      |> Enum.map(fn h -> h.hotspot_address end)
    
    new_organization_hotspots = Enum.reduce(hotspot_addresses, [], fn hotspot_address, acc ->
      if hotspot_address not in existing_org_hotspots do
        acc ++ [%{ hotspot_address: hotspot_address, organization_id: organization.id, claimed: true }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(new_organization_hotspots, fn attrs ->
          Repo.insert!(OrganizationHotspot.changeset(%OrganizationHotspot{}, attrs))
        end)
      end)
    do
      {:ok, length(new_organization_hotspots), new_organization_hotspots}
    end
  end

  def unclaim_org_hotspot(%OrganizationHotspot{} = org_hotspot, hotspot_address, organization) do
    Repo.transaction(fn ->
      delete_org_hotspot(org_hotspot)

      Groups.delete_hotspot_groups([hotspot_address], organization)
    end)
  end

  def unclaim_org_hotspots(hotspot_addresses, organization) do
    Repo.transaction(fn ->
      query = from(oh in OrganizationHotspot, where: oh.hotspot_address in ^hotspot_addresses and oh.organization_id == ^organization.id)
      Repo.delete_all(query)

      Groups.delete_hotspot_groups(hotspot_addresses, organization)
    end)
  end

  def prefer_hotspots(hotspot_addresses, organization) do
    org_hotspots = Enum.map(hotspot_addresses, fn address ->
        %{ hotspot_address: address, organization_id: organization.id, claimed: true, preferred: true }
      end)
    with {:ok, :ok} <- Repo.transaction(fn ->
      Enum.each(org_hotspots, fn attrs ->
        Repo.insert!(
          OrganizationHotspot.changeset(
            %OrganizationHotspot{},
            attrs
          ), on_conflict: {:replace, [:preferred]}, conflict_target: [:hotspot_address, :organization_id])
      end)
    end)
      do
        {:ok, length(hotspot_addresses), org_hotspots}
      end
  end
end
