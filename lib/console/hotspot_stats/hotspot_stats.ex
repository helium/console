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
        h.lng
      FROM (
        SELECT
          DISTINCT(hotspot_address),
          COUNT(hotspot_address) AS packet_count,
          COUNT(DISTINCT(device_id)) AS device_count
        FROM hotspot_stats
        WHERE organization_id = $1 and reported_at_epoch > $2
        GROUP BY hotspot_address
      ) stats
      LEFT JOIN hotspots h ON stats.hotspot_address = h.address
      LEFT JOIN organization_hotspots os ON stats.hotspot_address = os.hotspot_address
      ORDER BY
        CASE $4 WHEN 'asc' THEN
          CASE $3
            WHEN 'hotspot_name' THEN h.name
            WHEN 'long_city' THEN h.long_city
            WHEN 'status' THEN h.status
          END
        END ASC NULLS FIRST,
        CASE $4 WHEN 'desc' THEN
          CASE $3
            WHEN 'hotspot_name' THEN h.name
            WHEN 'long_city' THEN h.long_city
            WHEN 'status' THEN h.status
          END
        END DESC NULLS LAST
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
        h.lng
      FROM (
        SELECT
          DISTINCT(hotspot_address),
          COUNT(hotspot_address) AS packet_count,
          COUNT(DISTINCT(device_id)) AS device_count
        FROM hotspot_stats
        WHERE organization_id = $1 and reported_at_epoch > $2
        GROUP BY hotspot_address
      ) stats
      LEFT JOIN hotspots h ON stats.hotspot_address = h.address
      LEFT JOIN organization_hotspots os ON stats.hotspot_address = os.hotspot_address
      ORDER BY
        CASE $4 WHEN 'asc' THEN
          CASE $3
            WHEN 'packet_count' THEN stats.packet_count
            WHEN 'device_count' THEN stats.device_count
          END
        END ASC NULLS FIRST,
        CASE $4 WHEN 'desc' THEN
          CASE $3
            WHEN 'packet_count' THEN stats.packet_count
            WHEN 'device_count' THEN stats.device_count
          END
        END DESC NULLS LAST
    """
  end
end
