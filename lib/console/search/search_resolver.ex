defmodule Console.Search.SearchResolver do
  alias Console.Repo
  alias Console.Search

  def search(%{query: query}, %{context: %{current_team: current_team, current_organization: current_organization}}) do
    {:ok, Search.run(query, current_team, current_organization)}
  end
end
