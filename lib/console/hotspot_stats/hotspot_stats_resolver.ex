defmodule Console.HotspotStats.HotspotStatsResolver do
  alias Console.HotspotStats

  def all(_, %{context: %{current_organization: current_organization}}) do
    all_stats = HotspotStats.get_all_stats(current_organization)

    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)
    sql = """
      SELECT
        DISTINCT(hotspot_address),
        COUNT(hotspot_address) AS packet_count,
        COUNT(DISTINCT(device_id)) AS device_count
      FROM hotspot_stats
      WHERE organization_id = $1
      GROUP BY hotspot_address
      ORDER BY packet_count DESC
    """
    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [organization_id])

    hotspot_stats =
      result.rows
      |> Enum.map(fn r ->
        %{
          hotspot_address: Enum.at(r, 0),
          packet_count: Enum.at(r, 1),
          device_count: Enum.at(r, 2),
        }
      end)
    # todo: add getting data for past 48 hours and comparison

    {:ok, hotspot_stats}
  end
end
