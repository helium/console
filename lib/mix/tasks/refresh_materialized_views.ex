defmodule Mix.Tasks.RefreshMaterializedViews do
  use Mix.Task
  alias Console.Jobs

  def run(_) do
    IO.inspect "Refreshing materialized views..."
    Mix.Task.run("app.start")
    Jobs.refresh_materialized_views()
  end
end
