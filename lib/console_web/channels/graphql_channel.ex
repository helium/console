defmodule ConsoleWeb.GraphqlChannel do
  use Phoenix.Channel

  def join("graphql:topbar_orgs", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:orgs_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:invitations_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:members_table", _message, socket) do
    {:ok, socket}
  end
end
