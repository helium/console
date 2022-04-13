defmodule Mix.Tasks.SyncHotspots do
  use Mix.Task
  alias Console.Jobs

  def run(_) do
    IO.inspect "Syncing hotspots from public API"
    Mix.Task.run("app.start")
    Jobs.sync_hotspots()
  end
end