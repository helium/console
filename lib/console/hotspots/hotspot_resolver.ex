defmodule Console.Hotspots.HotspotResolver do
  alias Console.Hotspots

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
        0 -> ["None", 0]
        _ ->
          first_row = Enum.at(past_1d_result.rows, 0)
          {:ok, device_id} = Ecto.UUID.load(Enum.at(first_row, 0))

          [ device_id, Enum.at(first_row, 1) ]
      end

    attrs = %{
      past_1d_device_count: length(past_1d_result.rows),
      past_2d_device_count: length(past_2d_result.rows),
      past_1d_packet_count: past_1d_result.rows |> Enum.reduce(0, fn row, acc -> Enum.at(row, 1, 0) + acc end),
      past_2d_packet_count: past_2d_result.rows |> Enum.reduce(0, fn row, acc -> Enum.at(row, 1, 0) + acc end),
      most_heard_device_id: Enum.at(most_heard_device, 0),
      most_heard_packet_count: Enum.at(most_heard_device, 1),
      hotspot_name: hotspot.name,
      hotspot_address: hotspot.address
    }

    {:ok, Map.merge(hotspot, attrs) }
  end
end
