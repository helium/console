defmodule Console.Repo.Migrations.UpdateMatView do
  use Ecto.Migration

  def up do
    execute "DROP MATERIALIZED VIEW IF EXISTS device_stats_view;"
    execute """
    CREATE MATERIALIZED VIEW device_stats_view AS
      SELECT stats30d.device_id, packets_30d, packets_7d, dc_30d, dc_7d from
      (
        SELECT device_id, COUNT(*) AS packets_30d, SUM(dc_used) AS dc_30d FROM device_stats
        WHERE reported_at_epoch >= CAST(EXTRACT(epoch FROM NOW()) * 1000 - 2592000000 AS BIGINT) AND reported_at_epoch <= CAST(EXTRACT(epoch FROM NOW()) * 1000 - 86400000 AS BIGINT) GROUP BY device_id
      ) stats30d
      FULL OUTER JOIN
      (
        SELECT device_id, COUNT(*) AS packets_7d, SUM(dc_used) AS dc_7d FROM device_stats
        WHERE reported_at_epoch >= CAST(EXTRACT(epoch FROM NOW()) * 1000 - 604800000 AS BIGINT) AND reported_at_epoch <= CAST(EXTRACT(epoch FROM NOW()) * 1000 - 86400000 AS BIGINT) GROUP BY device_id
      ) stats7d
      ON stats30d.device_id = stats7d.device_id
    ;
    """
  end

  def down do
    execute "DROP MATERIALIZED VIEW device_stats_view;"
  end
end
