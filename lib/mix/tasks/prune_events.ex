defmodule Mix.Tasks.PruneEvents do
  use Mix.Task

  def run(db) do
    Mix.shell.cmd("psql -a #{db} -c 'select prune_events()'")
  end
end

# function created in psql
# CREATE OR REPLACE FUNCTION prune_events() RETURNS void AS $$
# BEGIN
#   EXECUTE format($f$delete from events where inserted_at < NOW() - INTERVAL '31 days'$f$);
#   RAISE NOTICE 'Pruned events table';
# END;
# $$ LANGUAGE plpgsql;
