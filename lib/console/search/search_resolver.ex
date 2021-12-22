defmodule Console.Search.SearchResolver do
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

  def search_functions(%{query: query}, %{context: %{current_organization: current_organization}}) do
    {:ok, Search.run_for_functions(query, current_organization)}
  end

  def paginated_search_hotspots(%{query: query, page: page, page_size: page_size, column: column, order: order}, %{context: %{current_organization: _current_organization}}) do
    {:ok, Search.run_for_hotspots(query, page, page_size, column, order)}
  end

  def search_channels_mobile(%{query: query}, %{context: %{current_organization: current_organization}}) do
    {:ok, Search.run_for_channels_mobile(query, current_organization)}
  end

  def search_devices_mobile(%{query: query}, %{context: %{current_organization: current_organization}}) do
    {:ok, Search.run_for_devices_mobile(query, current_organization)}
  end
end
