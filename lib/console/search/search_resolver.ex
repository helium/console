defmodule Console.Search.SearchResolver do
  alias Console.Repo
  alias Console.Search

  def search(%{query: query}, %{context: %{current_organization: current_organization}}) do
    {:ok, Search.run(query, current_organization)}
  end
end
