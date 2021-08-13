defmodule Console.HotspotStats do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.HotspotStats.HotspotStat

  def get_all_stats(organization) do
     from(hs in HotspotStat, where: hs.organization_id == ^organization.id)
     |> Repo.all()
  end

  def create_stat(attrs \\ %{}) do
    %HotspotStat{}
    |> HotspotStat.changeset(attrs)
    |> Repo.insert()
  end
end
