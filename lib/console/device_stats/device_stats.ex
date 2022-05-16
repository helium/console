defmodule Console.DeviceStats do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.DeviceStats.DeviceStat
  alias Console.DeviceStats.DeviceStatsView
  alias Console.DeviceStats.DeviceStatsViewCopy

  def create_stat(attrs \\ %{}) do
    %DeviceStat{}
    |> DeviceStat.changeset(attrs)
    |> Repo.insert()
  end

  def create_stat!(attrs \\ %{}) do
    %DeviceStat{}
    |> DeviceStat.changeset(attrs)
    |> Repo.insert!()
  end

  def get_stats_view_for_device(id) do
    try do
      Repo.get(DeviceStatsViewCopy, id)
    rescue
      _ -> Repo.get(DeviceStatsView, id)
    end
  end
end
