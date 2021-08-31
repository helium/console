defmodule Console.HotspotStats.HotspotStatsResolver do
  alias Console.Hotspots
  alias Console.Devices

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
    unix1d = current_unix - 86400000
    unix2d = current_unix - 86400000 * 2

    sql_1d = """
      SELECT
        COUNT(DISTINCT(device_id))
      FROM hotspot_stats
      WHERE organization_id = $1 and reported_at_epoch > $2
    """

    sql_2d = """
      SELECT
        COUNT(DISTINCT(device_id))
      FROM hotspot_stats
      WHERE organization_id = $1 and reported_at_epoch > $2 and reported_at_epoch < $3
    """
    result_1d = Ecto.Adapters.SQL.query!(Console.Repo, sql_1d, [organization_id, unix1d])
    result_2d = Ecto.Adapters.SQL.query!(Console.Repo, sql_2d, [organization_id, unix2d, unix1d])

    {:ok, %{
      count_1d: result_1d.rows |> Enum.at(0) |> Enum.at(0),
      count_2d: result_2d.rows |> Enum.at(0) |> Enum.at(0)
    }}
  end

  def show(%{ address: address }, %{context: %{current_organization: current_organization}}) do
    hotspot = Hotspots.get_hotspot!(address)

    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    unix2d = current_unix - 86400000 * 2

    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)
    sql_1d = """
      SELECT
        DISTINCT(device_id),
        COUNT(device_id) AS packet_count
      FROM hotspot_stats
      WHERE organization_id = $1 and hotspot_address = $2 and reported_at_epoch > $3
      GROUP BY device_id
      ORDER BY packet_count DESC
    """

    sql_2d = """
      SELECT
        DISTINCT(device_id),
        COUNT(device_id) AS packet_count
      FROM hotspot_stats
      WHERE organization_id = $1 and hotspot_address = $2 and reported_at_epoch < $3 and reported_at_epoch > $4
      GROUP BY device_id
      ORDER BY packet_count DESC
    """
    past_1d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_1d, [organization_id, address, unix1d])
    past_2d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_2d, [organization_id, address, unix1d, unix2d])

    most_heard_device =
      case length(past_1d_result.rows) do
        0 -> [nil, nil, 0]
        _ ->
          first_row = Enum.at(past_1d_result.rows, 0)
          {:ok, device_id} = Ecto.UUID.load(Enum.at(first_row, 0))

          device_name =
            case Devices.get_device(current_organization, device_id) do
              nil -> "Unknown"
              device -> device.name
            end

          [ device_id, device_name, Enum.at(first_row, 1) ]
      end

    attrs = %{
      device_count: length(past_1d_result.rows),
      device_count_2d: length(past_2d_result.rows),
      packet_count: past_1d_result.rows |> Enum.reduce(0, fn row, acc -> Enum.at(row, 1, 0) + acc end),
      packet_count_2d: past_2d_result.rows |> Enum.reduce(0, fn row, acc -> Enum.at(row, 1, 0) + acc end),
      most_heard_device_id: Enum.at(most_heard_device, 0),
      most_heard_device_name: Enum.at(most_heard_device, 1),
      most_heard_packet_count: Enum.at(most_heard_device, 2),
      hotspot_name: hotspot.name,
      hotspot_address: hotspot.address,
      latitude: hotspot.lat,
      longitude: hotspot.lng
    }

    {:ok, Map.merge(hotspot, attrs) }
  end

  def hotspot_show_packets(%{ address: address }, %{context: %{current_organization: current_organization}}) do
    hotspot = Hotspots.get_hotspot!(address)
    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)

    sql = """
      SELECT
        device_id,
        reported_at_epoch
      FROM hotspot_stats
      WHERE organization_id = $1 and hotspot_address = $2 and reported_at_epoch > $3
      ORDER BY reported_at_epoch DESC
    """
    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [organization_id, hotspot.address, unix1d])
    rows =
      result.rows
      |> Enum.map(fn r ->
        {:ok, device_id} = Ecto.UUID.load(Enum.at(r, 0))
        %{ reported_at_epoch: Enum.at(r, 1), device_id: device_id }
      end)

    {:ok, rows}
  end

  def hotspot_show_devices_heard(%{ address: address }, %{context: %{current_organization: current_organization}}) do
    hotspot = Hotspots.get_hotspot!(address)
    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)

    sql = """
      SELECT stats.device_id, d.name, stats.packet_count, stats.reported_at_epoch
      FROM
        (
          SELECT
            DISTINCT(device_id) AS device_id,
            COUNT(device_id) AS packet_count,
            MAX(reported_at_epoch) AS reported_at_epoch
          FROM hotspot_stats
          WHERE organization_id = $1 and hotspot_address = $2 and reported_at_epoch > $3
          GROUP BY device_id
        ) AS stats
      LEFT JOIN devices d ON stats.device_id = d.id
      ORDER BY packet_count DESC;
    """
    result = Ecto.Adapters.SQL.query!(Console.Repo, sql, [organization_id, hotspot.address, unix1d])
    rows =
      result.rows
      |> Enum.map(fn r ->
        {:ok, device_id} = Ecto.UUID.load(Enum.at(r, 0))
        %{
          device_id: device_id,
          device_name: Enum.at(r, 1),
          packet_count: Enum.at(r, 2),
          reported_at: Enum.at(r, 3) |> DateTime.from_unix!(:millisecond) |> DateTime.to_naive(),
        }
      end)

    {:ok, rows}
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
              latitude: attrs.lat,
              longitude: attrs.lng
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
              latitude: attrs.lat,
              longitude: attrs.lng
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
