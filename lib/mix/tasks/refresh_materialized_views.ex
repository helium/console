defmodule Mix.Tasks.RefreshMaterializedViews do
  use Mix.Task

  def run(_) do
    IO.inspect "Refreshing materialized views..."
    Mix.Task.run("app.start")

    with {:ok, _} <- Ecto.Adapters.SQL.query(Console.Repo, "REFRESH MATERIALIZED VIEW device_stats_view", [], timeout: :infinity) do
      with {:ok, _} <- Ecto.Adapters.SQL.query(Console.Repo, "DROP TABLE IF EXISTS device_stats_view_copy", [], timeout: :infinity) do
        Ecto.Adapters.SQL.query(Console.Repo, "CREATE TABLE device_stats_view_copy AS SELECT * FROM device_stats_view;", [], timeout: :infinity)
      end
    end
  end
end
