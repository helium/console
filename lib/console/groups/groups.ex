defmodule Console.Groups do
  @moduledoc """
  The Groups context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Groups.Group
  alias Console.Devices.Device
  alias Console.Channels.Channel
  alias Console.Teams.Team

  def get_group!(id), do: Repo.get!(Group, id)

  def insert_and_get_all_by_names([], team_id) do
    []
  end
  def insert_and_get_all_by_names(names, team_id) do
    maps = Enum.map(names, &%{name: &1, team_id: team_id, inserted_at: DateTime.utc_now, updated_at: DateTime.utc_now})
    Repo.insert_all(Group, maps, on_conflict: :nothing)
    Repo.all(from g in Group, where: g.name in ^names and g.team_id == ^team_id)
  end

  def create_group(%Team{} = team, attrs \\ %{}) do
    attrs = Map.merge(attrs, %{team_id: team.id})

    %Group{}
    |> Group.changeset(attrs)
    |> Repo.insert()
  end

  def add_to_group(%Device{} = device, %Group{} = group) do
    group
    |> Group.assoc_device_changeset(device)
    |> Repo.update!()
  end
  def add_to_group(%Channel{} = channel, %Group{} = group) do
    group
    |> Group.assoc_channel_changeset(channel)
    |> Repo.update!()
  end

  def fetch_assoc(%Group{} = group, assoc \\ [:team, :devices]) do
    Repo.preload(group, assoc)
  end
end
