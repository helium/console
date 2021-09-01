defmodule Console.HotspotStats.HotspotStatsResolver do
  alias Console.Hotspots
  alias Console.Devices
  alias Console.HotspotStats

  def all(%{ column: column, order: order }, %{context: %{current_organization: current_organization}}) do
    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    unix2d = current_unix - 86400000 * 2

    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)
    sql_1d =
      case column do
        "packet_count" -> HotspotStats.get_all_query_for_integer_sort()
        "device_count" -> HotspotStats.get_all_query_for_integer_sort()
        _ -> HotspotStats.get_all_query_for_string_sort()
      end

    past_1d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_1d, [organization_id, unix1d, column, order])

    hotspot_addresses =
      past_1d_result.rows
      |> Enum.map(fn r -> Enum.at(r, 0) end)

    sql_2d = """
      SELECT
        DISTINCT(hotspot_address),
        COUNT(hotspot_address) AS packet_count,
        COUNT(DISTINCT(device_id)) AS device_count
      FROM hotspot_stats
      WHERE organization_id = $1 and hotspot_address = ANY($2) and reported_at_epoch < $3 and reported_at_epoch > $4
      GROUP BY hotspot_address
    """
    past_2d_result = Ecto.Adapters.SQL.query!(Console.Repo, sql_2d, [organization_id, hotspot_addresses, unix1d, unix2d])

    results = generateStats(past_1d_result, past_2d_result)

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

    results = generateStats(past_1d_result, past_2d_result)

    {:ok, results}
  end

  def device_count(_, %{context: %{current_organization: current_organization}}) do
    {:ok, organization_id} = Ecto.UUID.dump(current_organization.id)
    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000

    sql_1d = """
      SELECT
        COUNT(DISTINCT(device_id))
      FROM hotspot_stats
      WHERE organization_id = $1 and reported_at_epoch > $2
    """

    result_1d = Ecto.Adapters.SQL.query!(Console.Repo, sql_1d, [organization_id, unix1d])

    {:ok, %{
      count_1d: result_1d.rows |> Enum.at(0) |> Enum.at(0)
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

  defp generateStats(past_1d_result, past_2d_result) do
    past_2d_hotspot_map =
      past_2d_result.rows
      |> Enum.reduce(%{}, fn r, acc ->
        Map.put(
          acc,
          Enum.at(r, 0),
          %{ packet_count_2d: Enum.at(r, 1), device_count_2d: Enum.at(r, 2) }
        )
      end)

    hotspot_stats =
      past_1d_result.rows
      |> Enum.map(fn r ->
        past_2d_stat =
          case Map.get(past_2d_hotspot_map, Enum.at(r, 0)) do
            nil -> %{ packet_count_2d: 0, device_count_2d: 0 }
            stat -> stat
          end

        %{
          hotspot_address: Enum.at(r, 0),
          hotspot_name: Enum.at(r, 3),
          packet_count: Enum.at(r, 1),
          device_count: Enum.at(r, 2),
          status: Enum.at(r, 4),
          long_city: Enum.at(r, 5),
          short_country: Enum.at(r, 6),
          short_state: Enum.at(r, 7),
          latitude: Enum.at(r, 8),
          longitude: Enum.at(r, 9),
        }
        |> Map.merge(past_2d_stat)
      end)

    hotspot_stats
  end
end
