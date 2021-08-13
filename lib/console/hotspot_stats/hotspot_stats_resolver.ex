defmodule Console.HotspotStats.HotspotStatsResolver do
  alias Console.Hotspots

  def all(_, %{context: %{current_organization: current_organization}}) do
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

    hotspot_addresses =
      result.rows
      |> Enum.map(fn r -> Enum.at(r, 0) end)

    hotspots_on_chain =
      Hotspots.get_hotspots(hotspot_addresses)
      |> Enum.reduce(%{}, fn hotspot, acc ->
        Map.put(acc, hotspot.address, hotspot)
      end)

    hotspot_stats =
      result.rows
      |> Enum.map(fn r ->
        case Map.fetch(hotspots_on_chain, Enum.at(r, 0)) do
          {:ok, attrs} ->
            %{
              hotspot_address: Enum.at(r, 0),
              hotspot_name: attrs.name,
              packet_count: Enum.at(r, 1),
              device_count: Enum.at(r, 2),
              status: attrs.status,
              long_city: attrs.long_city,
              short_country: attrs.short_country,
              short_state: attrs.short_state,
            }
          _ ->
            %{
              hotspot_address: Enum.at(r, 0),
              hotspot_name: "Unknown Hotspot",
              packet_count: Enum.at(r, 1),
              device_count: Enum.at(r, 2),
              status: "Unknown",
            }
        end
      end)
    # todo: add getting data for past 48 hours and comparison

    {:ok, hotspot_stats}
  end
end
