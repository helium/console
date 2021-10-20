defmodule Console.Groups do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Groups.Group
  alias Console.Groups.HotspotsGroups
  alias Console.Hotspots.Hotspot
  alias Console.Organizations.Organization

  def get_group!(id), do: Repo.get!(Group, id)
  def get_group(id), do: Repo.get(Group, id)
  def get_group!(organization, id) do
     Repo.get_by!(Group, [id: id, organization_id: organization.id])
  end

  def get_groups(organization, ids) do
     from(g in Group, where: g.id in ^ids and g.organization_id == ^organization.id)
     |> Repo.all()
  end

  def get_groups_and_attached_hotspots(ids) do
    from(g in Group, where: g.id in ^ids)
    |> preload([:hotspots])
    |> Repo.all()
  end

  def get_groups_of_hotspot(hotspot) do
     from(hg in HotspotsGroups, where: hg.hotspot_address == ^hotspot.address)
     |> Repo.all()
  end

  def get_group(organization, id) do
     Repo.get_by(Group, [id: id, organization_id: organization.id])
  end

  def fetch_assoc(%Group{} = group, assoc \\ [:hotspots]) do
    Repo.preload(group, assoc)
  end

  def multi_fetch_assoc(groups, assoc \\ [:hotspots]) do
    Repo.preload(groups, assoc)
  end

  def get_group_by_name(name, organization_id) do
    Repo.get_by(Group, [name: name, organization_id: organization_id])
  end

  def create_group(%Organization{} = organization, attrs \\ %{}) do
    %Group{}
    |> Group.changeset(attrs)
    |> Repo.insert()
  end

  def create_group!(%Organization{} = organization, attrs \\ %{}) do
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

  def delete_groups(group_ids, organization_id) do
    group_ids = from(g in Group, where: g.organization_id == ^organization_id and g.id in ^group_ids) |> Repo.all() |> Enum.map(fn g -> g.id end)

    Ecto.Multi.new()
      |> Ecto.Multi.run(:hotspots_groups, fn _repo, _ ->
        with {count, nil} <- from(hg in HotspotsGroups, where: hg.group_id in ^group_ids) |> Repo.delete_all() do
          {:ok, count}
        end
      end)
      |> Ecto.Multi.run(:groups, fn _repo, _ ->
        with {count, nil} <- from(g in Group, where: g.id in ^group_ids) |> Repo.delete_all() do
          {:ok, count}
        end
      end)
     |> Repo.transaction()
  end

  def add_hotspots_to_group(hotspots, groups, to_group, organization) do
    groups_query = from(g in Group, preload: [:hotspots], where: g.id in ^groups and g.organization_id == ^organization.id, select: g)
    group_hotspots = Repo.all(groups_query) |> Enum.flat_map(fn %Group{ hotspots: hotspots } -> hotspots end)

    hotspots_query = from(d in Hotspot, where: d.id in ^hotspots and d.organization_id == ^organization.id, select: d)
    other_hotspots = Repo.all(hotspots_query)

    all_hotspots = Enum.concat(group_hotspots, other_hotspots) |> Enum.uniq()

    hotspots_groups = Enum.reduce(all_hotspots, [], fn hotspot, acc ->
      if Repo.get_by(HotspotsGroups, hotspot_id: hotspot.id, group_id: to_group) == nil do
        acc ++ [%{ hotspot_id: hotspot.id, group_id: to_group }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(hotspots_groups, fn attrs ->
          Repo.insert!(HotspotsGroups.changeset(%HotspotsGroups{}, attrs))
        end)
      end)
    do
      {:ok, length(hotspots_groups), hotspots_groups}
    end
  end

  def get_hotspot_groups(hotspot_id) do
    from(hg in HotspotsGroups, where: hg.hotspot_id == ^hotspot_id)
     |> Repo.all()
  end

  def add_hotspots_to_group(hotspots, to_group, organization) do
    hotspots_query = from(d in Hotspot, where: d.id in ^hotspots and d.organization_id == ^organization.id, select: d)
    all_hotspots = Repo.all(hotspots_query)

    hotspots_groups = Enum.reduce(all_hotspots, [], fn hotspot, acc ->
      if Repo.get_by(HotspotsGroups, hotspot_id: hotspot.id, group_id: to_group) == nil do
        acc ++ [%{ hotspot_id: hotspot.id, group_id: to_group }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(hotspots_groups, fn attrs ->
          Repo.insert!(HotspotsGroups.changeset(%HotspotsGroups{}, attrs))
        end)
      end)
    do
      {:ok, length(hotspots_groups), hotspots_groups}
    end
  end

  def delete_hotspots_from_group(hotspots, group_id, organization) do
    case get_group(organization, group_id) do
      nil -> { :error }
      _ ->
        query = from(hg in HotspotsGroups, where: hg.hotspot_id in ^hotspots and hg.group_id == ^group_id)
        Repo.delete_all(query)
    end
  end

  def delete_groups_from_hotspot(groups, hotspot_id, organization) do
    case Hotspots.get_hotspot(organization, hotspot_id) do
      nil -> { :error }
      _ ->
        query = from(hg in HotspotsGroups, where: hg.group_id in ^groups and hg.hotspot_id == ^hotspot_id)
        Repo.delete_all(query)
    end
  end

  def delete_all_groups_from_hotspots(hotspot_ids, organization) do
    hotspots = Hotspots.get_hotspots(organization, hotspot_ids)
    case hotspots do
      [] -> { :error }
      _ ->
        ids = Enum.map(hotspots, fn d -> d.id end)
        query = from(hg in HotspotsGroups, where: hg.hotspot_id in ^ids)
        Repo.delete_all(query)
        { :ok, hotspots }
    end
  end

  def delete_all_groups_from_hotspots_for_org(organization) do
    hotspots = Hotspots.get_hotspots(organization.id)

    ids = Enum.map(hotspots, fn hotspot -> hotspot.id end)

    from(hg in HotspotsGroups, where: hg.hotspot_id in ^ids)
    |> Repo.delete_all()

    List.first(hotspots)
  end

  def delete_all_hotspots_from_groups(group_ids, organization) do
    groups = get_groups(organization, group_ids)
    case groups do
      [] -> { :error }
      _ ->
        ids = Enum.map(groups, fn g -> g.id end)
        query = from(hg in HotspotsGroups, where: hg.group_id in ^ids)
        Repo.delete_all(query)
        { :ok, groups }
    end
  end

  def add_groups_to_hotspot(groups, hotspot, organization) do
    groups_query = from(g in Group, where: g.id in ^groups and g.organization_id == ^organization.id, select: g)
    all_groups = Repo.all(groups_query)

    hotspots_groups = Enum.reduce(all_groups, [], fn group, acc ->
      if Repo.get_by(HotspotsGroups, hotspot_id: hotspot.id, group_id: group.id) == nil do
        acc ++ [%{ hotspot_id: hotspot.id, group_id: group.id }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(hotspots_groups, fn attrs ->
          Repo.insert!(HotspotsGroups.changeset(%HotspotsGroups{}, attrs))
        end)
      end)
    do
      {:ok, length(hotspots_groups), List.first(all_groups)}
    end
  end

  def create_groups_add_hotspot(hotspot, group_names, organization, user) do
    Repo.transaction(fn ->
      groups = Enum.reduce(group_names, [], fn group_name, acc ->
        # create a group, store the id, and add
        new_group = create_group!(organization, %{"name" => group_name, "creator" => user.email, "organization_id" => organization.id})
        acc ++ [new_group.id]
      end)
      add_groups_to_hotspot(groups, hotspot, organization)
    end)
  end
end
