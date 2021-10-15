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

  def get_all_query_for_string_sort() do
    """
      SELECT
        stats.hotspot_address,
        stats.packet_count,
        stats.device_count,
        h.name,
        h.status,
        h.long_city,
        h.short_country,
        h.short_state,
        h.lat,
        h.lng,
        os.alias,
        stats.avg_rssi,
        COUNT(*) OVER() AS total_entries
      FROM (
        SELECT
          DISTINCT(hotspot_address),
          COUNT(hotspot_address) AS packet_count,
          COUNT(DISTINCT(device_id)) AS device_count,
          AVG(rssi) AS avg_rssi
        FROM hotspot_stats
        WHERE organization_id = $1 and reported_at_epoch > $2
        GROUP BY hotspot_address
      ) stats
      LEFT JOIN hotspots h ON stats.hotspot_address = h.address
      LEFT JOIN organization_hotspots os ON stats.hotspot_address = os.hotspot_address and os.organization_id = $1
      ORDER BY
        CASE $4 WHEN 'asc' THEN
          CASE $3
            WHEN 'hotspot_name' THEN h.name
            WHEN 'long_city' THEN h.long_city
            WHEN 'status' THEN h.status
            WHEN 'alias' THEN os.alias
          END
        END ASC NULLS FIRST,
        CASE $4 WHEN 'desc' THEN
          CASE $3
            WHEN 'hotspot_name' THEN h.name
            WHEN 'long_city' THEN h.long_city
            WHEN 'status' THEN h.status
            WHEN 'alias' THEN os.alias
          END
        END DESC NULLS LAST
      LIMIT $5
      OFFSET $6
    """
  end

  def get_all_query_for_integer_sort() do
    """
      SELECT
        stats.hotspot_address,
        stats.packet_count,
        stats.device_count,
        h.name,
        h.status,
        h.long_city,
        h.short_country,
        h.short_state,
        h.lat,
        h.lng,
        os.alias,
        stats.avg_rssi,
        COUNT(*) OVER() AS total_entries
      FROM (
        SELECT
          DISTINCT(hotspot_address),
          COUNT(hotspot_address) AS packet_count,
          COUNT(DISTINCT(device_id)) AS device_count,
          AVG(rssi) AS avg_rssi
        FROM hotspot_stats
        WHERE organization_id = $1 and reported_at_epoch > $2
        GROUP BY hotspot_address
      ) stats
      LEFT JOIN hotspots h ON stats.hotspot_address = h.address
      LEFT JOIN organization_hotspots os ON stats.hotspot_address = os.hotspot_address and os.organization_id = $1
      ORDER BY
        CASE $4 WHEN 'asc' THEN
          CASE $3
            WHEN 'packet_count' THEN stats.packet_count
            WHEN 'device_count' THEN stats.device_count
            WHEN 'signal' THEN stats.avg_rssi
          END
        END ASC NULLS FIRST,
        CASE $4 WHEN 'desc' THEN
          CASE $3
            WHEN 'packet_count' THEN stats.packet_count
            WHEN 'device_count' THEN stats.device_count
            WHEN 'signal' THEN stats.avg_rssi
          END
        END DESC NULLS LAST
      LIMIT $5
      OFFSET $6
    """
  end

  def get_followed_query_for_string_sort() do
    """
      SELECT
        parsed_stats.hotspot_address,
        parsed_stats.packet_count,
        parsed_stats.device_count,
        h.name,
        h.status,
        h.long_city,
        h.short_country,
        h.short_state,
        h.lat,
        h.lng,
        oh.alias,
        parsed_stats.avg_rssi,
        COUNT(*) OVER() AS total_entries
      FROM (
        SELECT
         hotspot_address,
         CASE
           WHEN device_count = 0 THEN 0
           ELSE packet_count
         END AS packet_count,
         device_count,
         avg_rssi
        FROM (
          SELECT
            DISTINCT(stats.hotspot_address),
            COUNT(stats.hotspot_address) AS packet_count,
            COUNT(DISTINCT(stats.device_id)) AS device_count,
            AVG(stats.rssi) AS avg_rssi
          FROM (
            SELECT oh.hotspot_address, hs.device_id, hs.rssi, COALESCE(hs.reported_at_epoch, $2) AS reported_at_epoch FROM (
              SELECT * FROM organization_hotspots
              WHERE organization_id = $1 and claimed = true
            ) oh
            LEFT JOIN (
              SELECT * FROM hotspot_stats
              WHERE organization_id = $1 and reported_at_epoch > $3
            ) hs ON oh.hotspot_address = hs.hotspot_address
          ) stats
          GROUP BY stats.hotspot_address
        ) grouped_stats
      ) parsed_stats
      LEFT JOIN hotspots h ON parsed_stats.hotspot_address = h.address
      LEFT JOIN organization_hotspots oh ON parsed_stats.hotspot_address = oh.hotspot_address and oh.organization_id = $1
      ORDER BY
        CASE $5 WHEN 'asc' THEN
          CASE $4
            WHEN 'hotspot_name' THEN h.name
            WHEN 'long_city' THEN h.long_city
            WHEN 'status' THEN h.status
            WHEN 'alias' THEN oh.alias
          END
        END ASC NULLS FIRST,
        CASE $5 WHEN 'desc' THEN
          CASE $4
            WHEN 'hotspot_name' THEN h.name
            WHEN 'long_city' THEN h.long_city
            WHEN 'status' THEN h.status
            WHEN 'alias' THEN oh.alias
          END
        END DESC NULLS LAST
      LIMIT $6
      OFFSET $7
    """
  end

  def get_followed_query_for_integer_sort() do
    """
      SELECT
        parsed_stats.hotspot_address,
        parsed_stats.packet_count,
        parsed_stats.device_count,
        h.name,
        h.status,
        h.long_city,
        h.short_country,
        h.short_state,
        h.lat,
        h.lng,
        oh.alias,
        parsed_stats.avg_rssi,
        COUNT(*) OVER() AS total_entries
      FROM (
        SELECT
         hotspot_address,
         CASE
           WHEN device_count = 0 THEN 0
           ELSE packet_count
         END AS packet_count,
         device_count,
         avg_rssi
        FROM (
          SELECT
            DISTINCT(stats.hotspot_address),
            COUNT(stats.hotspot_address) AS packet_count,
            COUNT(DISTINCT(stats.device_id)) AS device_count,
            AVG(stats.rssi) AS avg_rssi
          FROM (
            SELECT oh.hotspot_address, hs.device_id, hs.rssi, COALESCE(hs.reported_at_epoch, $2) AS reported_at_epoch FROM (
              SELECT * FROM organization_hotspots
              WHERE organization_id = $1 and claimed = true
            ) oh
            LEFT JOIN (
              SELECT * FROM hotspot_stats
              WHERE organization_id = $1 and reported_at_epoch > $3
            ) hs ON oh.hotspot_address = hs.hotspot_address
          ) stats
          GROUP BY stats.hotspot_address
        ) grouped_stats
      ) parsed_stats
      LEFT JOIN hotspots h ON parsed_stats.hotspot_address = h.address
      LEFT JOIN organization_hotspots oh ON parsed_stats.hotspot_address = oh.hotspot_address and oh.organization_id = $1
      ORDER BY
        CASE $5 WHEN 'asc' THEN
          CASE $4
            WHEN 'packet_count' THEN parsed_stats.packet_count
            WHEN 'device_count' THEN parsed_stats.device_count
          END
        END ASC NULLS FIRST,
        CASE $5 WHEN 'desc' THEN
          CASE $4
            WHEN 'packet_count' THEN parsed_stats.packet_count
            WHEN 'device_count' THEN parsed_stats.device_count
          END
        END DESC NULLS LAST
      LIMIT $6
      OFFSET $7
    """
  end

  def get_device_heard_query_for_string_sort() do
    """
      SELECT
        stats.device_id,
        d.name,
        stats.packet_count,
        stats.reported_at_epoch,
        COUNT(*) OVER() AS total_entries,
        stats.rssi,
        stats.snr
      FROM
        (
          SELECT
            DISTINCT(device_id) AS device_id,
            COUNT(device_id) AS packet_count,
            MAX(reported_at_epoch) AS reported_at_epoch,
            AVG(rssi) AS rssi,
            AVG(snr) AS snr
          FROM hotspot_stats
          WHERE organization_id = $1 and hotspot_address = $2 and reported_at_epoch > $3
          GROUP BY device_id
        ) AS stats
      LEFT JOIN devices d ON stats.device_id = d.id
      ORDER BY
        CASE $5 WHEN 'asc' THEN
          CASE $4
            WHEN 'device_name' THEN d.name
          END
        END ASC NULLS FIRST,
        CASE $5 WHEN 'desc' THEN
          CASE $4
            WHEN 'device_name' THEN d.name
          END
        END DESC NULLS LAST
      LIMIT $6
      OFFSET $7
    """
  end

  def get_device_heard_query_for_integer_sort() do
    """
      SELECT
        stats.device_id,
        d.name,
        stats.packet_count,
        stats.reported_at_epoch,
        COUNT(*) OVER() AS total_entries,
        stats.rssi,
        stats.snr
      FROM
        (
          SELECT
            DISTINCT(device_id) AS device_id,
            COUNT(device_id) AS packet_count,
            MAX(reported_at_epoch) AS reported_at_epoch,
            AVG(rssi) AS rssi,
            AVG(snr) AS snr
          FROM hotspot_stats
          WHERE organization_id = $1 and hotspot_address = $2 and reported_at_epoch > $3
          GROUP BY device_id
        ) AS stats
      LEFT JOIN devices d ON stats.device_id = d.id
      ORDER BY
        CASE $5 WHEN 'asc' THEN
          CASE $4
            WHEN 'packet_count' THEN stats.packet_count
            WHEN 'reported_at' THEN stats.reported_at_epoch
            WHEN 'rssi' THEN stats.rssi
            WHEN 'snr' THEN stats.snr
          END
        END ASC NULLS FIRST,
        CASE $5 WHEN 'desc' THEN
          CASE $4
            WHEN 'packet_count' THEN stats.packet_count
            WHEN 'reported_at' THEN stats.reported_at_epoch
            WHEN 'rssi' THEN stats.rssi
            WHEN 'snr' THEN stats.snr
          END
        END DESC NULLS LAST
      LIMIT $6
      OFFSET $7
    """
  end
end
