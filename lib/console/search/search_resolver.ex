defmodule Console.Search.SearchResolver do
  alias Console.Repo
  alias Console.Search

  def search(%{query: query}, %{context: %{current_organization: current_organization}}) do
    {:ok, Search.run(query, current_organization)}
  end

  def search_devices(%{query: query}, %{context: %{current_organization: current_organization}}) do
    {:ok, Search.run_for_devices(query, current_organization)}
  end

  def search_labels(%{query: query}, %{context: %{current_organization: current_organization}}) do
    {:ok, Search.run_for_labels(query, current_organization)}
  end
end
