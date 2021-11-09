defmodule Console.Groups.GroupResolver do
  alias Console.Repo
  alias Console.Groups.Group
  alias Console.Groups.HotspotGroup
  alias Console.Hotspots.Hotspot
  import Ecto.Query

  def paginate_by_hotspot(%{page: page, page_size: page_size, hotspot_id: hotspot_id, column: column, order: order}, %{context: %{current_organization: current_organization}}) do
    order_by = {String.to_existing_atom(order), String.to_existing_atom(column)}

    query = from g in Group,
      join: hg in HotspotGroup,
      on: hg.group_id == g.id,
      where: g.organization_id == ^current_organization.id and hg.hotspot_id == ^hotspot_id,
      order_by: ^order_by

    groups = query |> Repo.paginate(page: page, page_size: page_size)

    {:ok, groups}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    group = Ecto.assoc(current_organization, :groups) |> preload([:hotspots]) |> Repo.get!(id)

    hotspots = group.hotspots
      |> Enum.map(fn h ->
        Map.drop(h, [:app_key])
      end)

    {:ok, group |> Map.put(:hotspots, hotspots)}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    hotspot_query = from h in Hotspot, select: %{ id: h.id, hotspot_name: h.name, hotspot_address: h.address }
    groups = Group
      |> where([g], g.organization_id == ^current_organization.id)
      |> preload([hotspots: ^hotspot_query])
      |> Repo.all()

    {:ok, groups}
  end

  def get_names(%{group_ids: group_ids}, %{context: %{current_organization: current_organization}}) do
    query = from g in Group,
      where: g.organization_id == ^current_organization.id and g.id in ^group_ids

    {:ok, query |> Repo.all()}
  end
end
