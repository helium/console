defmodule Console.Search.SearchResolver do
  alias Console.Repo
  alias Console.Search

  def search(%{query: query}, %{context: %{current_team: current_team}}) do
    {:ok, Search.run(query, current_team)}
  end
end
