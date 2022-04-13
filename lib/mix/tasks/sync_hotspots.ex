defmodule Mix.Tasks.SyncHotspots do
  use Mix.Task
  alias Console.Jobs

  def run(_) do
    IO.inspect "Starting to sync hotspots..."
    Mix.Task.run("app.start")
    Jobs.sync_hotspots()
  end
end