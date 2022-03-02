defmodule Mix.Tasks.PruneEvents do
  use Mix.Task

  def run(db) do
    IO.inspect "Pruned events, device_stats, hotspot_stats from db"
    Mix.shell.cmd("psql -a #{db} -c 'select prune_events()'")
    Mix.shell.cmd("psql -a #{db} -c 'select prune_device_stats()'")
    Mix.shell.cmd("psql -a #{db} -c 'select prune_hotspot_stats()'")
  end
end

# function created in psql
# CREATE OR REPLACE FUNCTION prune_events() RETURNS void AS $$
# BEGIN
#   EXECUTE format($f$delete from events where inserted_at < NOW() - INTERVAL '7 days'$f$);
#   RAISE NOTICE 'Pruned events table';
# END;
# $$ LANGUAGE plpgsql;

# function created in psql
# CREATE OR REPLACE FUNCTION prune_device_stats() RETURNS void AS $$
# BEGIN
#   EXECUTE format($f$delete from device_stats where inserted_at < NOW() - INTERVAL '30 days'$f$);
#   RAISE NOTICE 'Pruned device stats table';
# END;
# $$ LANGUAGE plpgsql;

# function created in psql
# CREATE OR REPLACE FUNCTION prune_hotspot_stats() RETURNS void AS $$
# BEGIN
#   EXECUTE format($f$delete from hotspot_stats where inserted_at < NOW() - INTERVAL '25 hours'$f$);
#   RAISE NOTICE 'Pruned hotspot stats table';
# END;
# $$ LANGUAGE plpgsql;
