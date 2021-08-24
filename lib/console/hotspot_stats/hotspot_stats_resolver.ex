defmodule Console.HotspotStats.HotspotStatsResolver do
  alias Console.Hotspots

  def all(_, %{context: %{current_organization: current_organization}}) do
    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    unix2d = current_unix - 86400000 * 2

    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)
    sql_1d = """
      SELECT
        DISTINCT(hotspot_address),
        COUNT(hotspot_address) AS packet_count,
        COUNT(DISTINCT(device_id)) AS device_count
      FROM hotspot_stats
      WHERE organization_id = $1 and reported_at_epoch > $2
      GROUP BY hotspot_address
      ORDER BY packet_count DESC
    """

    sql_2d = """
      SELECT
        DISTINCT(hotspot_address),
        COUNT(hotspot_address) AS packet_count,
        COUNT(DISTINCT(device_id)) AS device_count
      FROM hotspot_stats
      WHERE organization_id = $1 and reported_at_epoch < $2 and reported_at_epoch > $3
      GROUP BY hotspot_address
      ORDER BY packet_count DESC
    """
    past_1d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_1d, [organization_id, unix1d])
    past_2d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_2d, [organization_id, unix1d, unix2d])

    hotspot_addresses =
      past_1d_result.rows ++ past_2d_result.rows
      |> Enum.map(fn r -> Enum.at(r, 0) end)
      |> Enum.uniq()

    hotspots_on_chain =
      Hotspots.get_hotspots(hotspot_addresses)
      |> Enum.reduce(%{}, fn hotspot, acc ->
        Map.put(acc, hotspot.address, hotspot)
      end)

    results = generateStats(past_1d_result, past_2d_result, hotspots_on_chain)

    {:ok, results}
  end

  def followed(_, %{context: %{current_organization: current_organization}}) do
    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    unix2d = current_unix - 86400000 * 2

    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)

    sql_1d = """
      SELECT
        DISTINCT(q1.hotspot_address),
        COUNT(q1.device_id) AS packet_count,
        COUNT(DISTINCT(q1.device_id)) AS device_count
      FROM (
        SELECT oh.hotspot_address, hs.reported_at_epoch, hs.device_id
        FROM organization_hotspots oh LEFT JOIN (
          SELECT * FROM hotspot_stats WHERE organization_id = $1 and reported_at_epoch > $2
        ) hs ON oh.hotspot_address = hs.hotspot_address
      ) AS q1
      GROUP BY hotspot_address
      ORDER BY packet_count DESC;
    """

    sql_2d = """
      SELECT
        DISTINCT(q1.hotspot_address),
        COUNT(q1.device_id) AS packet_count,
        COUNT(DISTINCT(q1.device_id)) AS device_count
      FROM (
        SELECT oh.hotspot_address, hs.reported_at_epoch, hs.device_id
        FROM organization_hotspots oh LEFT JOIN (
          SELECT * FROM hotspot_stats WHERE organization_id = $1 and reported_at_epoch < $2 and reported_at_epoch > $3
        ) hs ON oh.hotspot_address = hs.hotspot_address
      ) AS q1
      GROUP BY hotspot_address
      ORDER BY packet_count DESC;
    """

    past_1d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_1d, [organization_id, unix1d])
    past_2d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_2d, [organization_id, unix1d, unix2d])

    hotspot_addresses =
      past_1d_result.rows
      |> Enum.map(fn r -> Enum.at(r, 0) end)

    hotspots_on_chain =
      Hotspots.get_hotspots(hotspot_addresses)
      |> Enum.reduce(%{}, fn hotspot, acc ->
        Map.put(acc, hotspot.address, hotspot)
      end)

      results = generateStats(past_1d_result, past_2d_result, hotspots_on_chain)

      {:ok, results}
  end

  def device_count(_, %{context: %{current_organization: current_organization}}) do
    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)
    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix2d = current_unix - 86400000

    sql = """
      SELECT
        COUNT(DISTINCT(device_id))
      FROM hotspot_stats
      WHERE organization_id = $1 and reported_at_epoch > $2
    """
    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [organization_id, unix2d])
    {:ok, %{ count: result.rows |> Enum.at(0) |> Enum.at(0) }}
  end

  defp generateStats(past_1d_result, past_2d_result, hotspots_on_chain) do
    past_1d_hotspot_map =
      past_1d_result.rows
      |> Enum.reduce(%{}, fn r, acc -> Map.put(acc, Enum.at(r, 0), true) end)

    past_2d_hotspot_map =
      past_2d_result.rows
      |> Enum.reduce(%{}, fn r, acc ->
        Map.put(
          acc,
          Enum.at(r, 0),
          %{ packet_count_2d: Enum.at(r, 1), device_count_2d: Enum.at(r, 2) }
        )
      end)

    hotspot_stats_d1 =
      past_1d_result.rows
      |> Enum.map(fn r ->
        past_2d_stat =
          case Map.get(past_2d_hotspot_map, Enum.at(r, 0)) do
            nil -> %{ packet_count_2d: 0, device_count_2d: 0 }
            stat -> stat
          end

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
            |> Map.merge(past_2d_stat)
          _ ->
            %{
              hotspot_address: Enum.at(r, 0),
              hotspot_name: "Unknown Hotspot",
              packet_count: Enum.at(r, 1),
              device_count: Enum.at(r, 2),
              status: "Unknown",
            }
            |> Map.merge(past_2d_stat)
        end
      end)

    hotspot_stats_d2_only =
      past_2d_result.rows
      |> Enum.filter(fn r -> Map.get(past_1d_hotspot_map, Enum.at(r, 0)) == nil end)
      |> Enum.map(fn r ->
        case Map.fetch(hotspots_on_chain, Enum.at(r, 0)) do
          {:ok, attrs} ->
            %{
              hotspot_address: Enum.at(r, 0),
              hotspot_name: attrs.name,
              packet_count: 0,
              device_count: 0,
              packet_count_2d: Enum.at(r, 1),
              device_count_2d: Enum.at(r, 2),
              status: attrs.status,
              long_city: attrs.long_city,
              short_country: attrs.short_country,
              short_state: attrs.short_state,
            }
          _ ->
            %{
              hotspot_address: Enum.at(r, 0),
              hotspot_name: "Unknown Hotspot",
              packet_count: 0,
              device_count: 0,
              packet_count_2d: Enum.at(r, 1),
              device_count_2d: Enum.at(r, 2),
              status: "Unknown",
            }
        end
      end)

    hotspot_stats_d1 ++ hotspot_stats_d2_only
  end
end
