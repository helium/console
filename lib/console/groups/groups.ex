defmodule Console.Groups do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Groups.Group
  alias Console.Groups.HotspotGroup
  alias Console.Hotspots.Hotspot

  def get_group!(id), do: Repo.get!(Group, id)
  def get_group(id), do: Repo.get(Group, id)
  def get_group!(organization, id) do
     Repo.get_by!(Group, [id: id, organization_id: organization.id])
  end

   def get_group(organization, id) do
     Repo.get_by(Group, [id: id, organization_id: organization.id])
  end

  def get_groups(organization, ids) do
     from(g in Group, where: g.id in ^ids and g.organization_id == ^organization.id)
     |> Repo.all()
  end

  def get_hotspot_group!(hotspot_id, group_id) do
    from(hg in HotspotGroup, where: hg.hotspot_id == ^hotspot_id and hg.group_id == ^group_id)
    |> Repo.one!()
  end

  def create_group(attrs \\ %{}) do
    %Group{}
    |> Group.changeset(attrs)
    |> Repo.insert()
  end

  def create_group!(attrs \\ %{}) do
    %Group{}
    |> Group.changeset(attrs)
    |> Repo.insert!()
  end

  def update_group(%Group{} = group, attrs) do
    group
    |> Group.changeset(attrs)
    |> Repo.update()
  end

  def delete_group(%Group{} = group) do
    Repo.delete(group)
  end

  def add_hotspots_to_group(hotspots, groups, to_group, organization) do
    groups_query = from(g in Group, preload: [:hotspots], where: g.id in ^groups and g.organization_id == ^organization.id, select: g)
    group_hotspots = Repo.all(groups_query) |> Enum.flat_map(fn %Group{ hotspots: hotspots } -> hotspots end)

    hotspots_query = from(d in Hotspot, where: d.id in ^hotspots and d.organization_id == ^organization.id, select: d)
    other_hotspots = Repo.all(hotspots_query)

    all_hotspots = Enum.concat(group_hotspots, other_hotspots) |> Enum.uniq()

    hotspots_groups = Enum.reduce(all_hotspots, [], fn hotspot, acc ->
      if Repo.get_by(HotspotGroup, hotspot_id: hotspot.id, group_id: to_group) == nil do
        acc ++ [%{ hotspot_id: hotspot.id, group_id: to_group }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(hotspots_groups, fn attrs ->
          Repo.insert!(HotspotGroup.changeset(%HotspotGroup{}, attrs))
        end)
      end)
    do
      {:ok, length(hotspots_groups), hotspots_groups}
    end
  end

  def add_hotspot_to_group(%{ "group_id" => _group_id, "hotspot_id" => _hotspot_id } = attrs) do
    Repo.insert(HotspotGroup.changeset(%HotspotGroup{}, attrs))
  end

  def remove_hotspot_from_group(%{ "group_id" => group_id, "hotspot_id" => hotspot_id }) do
    hotspot_group = get_hotspot_group!(hotspot_id, group_id)
    Repo.delete(hotspot_group)
  end

  def add_groups_to_hotspot(groups, hotspot, organization) do
    groups_query = from(g in Group, where: g.id in ^groups and g.organization_id == ^organization.id, select: g)
    all_groups = Repo.all(groups_query)

    hotspots_groups = Enum.reduce(all_groups, [], fn group, acc ->
      if Repo.get_by(HotspotGroup, hotspot_id: hotspot.id, group_id: group.id) == nil do
        acc ++ [%{ hotspot_id: hotspot.id, group_id: group.id }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(hotspots_groups, fn attrs ->
          Repo.insert!(HotspotGroup.changeset(%HotspotGroup{}, attrs))
        end)
      end)
    do
      {:ok, length(hotspots_groups), List.first(all_groups)}
    end
  end
end
