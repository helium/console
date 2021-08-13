defmodule Console.HotspotStats.HotspotStatsResolver do
  alias Console.Repo
  import Ecto.Query
  alias Console.HotspotStats

  def all(_, %{context: %{current_organization: current_organization}}) do
    all_stats = HotspotStats.get_all_stats(current_organization)
    # todo: add getting data for past 48 hours

    {:ok, all_stats}
  end
end
