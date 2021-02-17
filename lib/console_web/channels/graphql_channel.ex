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

  def join("graphql:api_keys", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:dc_index", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:dc_purchases_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:function_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:function_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:channels_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:channel_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:labels_index_table", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:label_show", _message, socket) do
    {:ok, socket}
  end

  def join("graphql:label_show_table", _message, socket) do
    {:ok, socket}
  end
end
