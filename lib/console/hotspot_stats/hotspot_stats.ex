defmodule Console.HotspotStats do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.HotspotStats.HotspotStat

  def create_stat(attrs \\ %{}) do
    %HotspotStat{}
    |> HotspotStat.changeset(attrs)
    |> Repo.insert()
  end
end
