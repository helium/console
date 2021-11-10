defmodule ConsoleWeb.GroupController do
  use ConsoleWeb, :controller

  alias Console.Groups
  alias Console.Groups.Group
  alias Console.Hotspots
  alias Console.Groups.HotspotGroup

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"group" => group_params}) do
    current_organization = conn.assigns.current_organization
    group_params =
      Map.merge(group_params, %{
        "organization_id" => current_organization.id
      })

    with {:ok, %Group{} = group} <- Groups.create_group(group_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:groups_index", "graphql:groups_index:#{current_organization.id}:org_groups_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:followed_hotspots_groups", "graphql:followed_hotspots_groups:#{current_organization.id}:org_groups_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:followed_hotspot_table", "graphql:followed_hotspot_table:#{current_organization.id}:hotspot_group_update", %{})

      conn
      |> put_status(:created)
      |> put_resp_header("message",  "Group #{group.name} added successfully")
      |> render("show.json", group: group)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    group = Groups.get_group!(current_organization, id)

    with {:ok, %Group{} = group} <- Groups.delete_group(group) do
      ConsoleWeb.Endpoint.broadcast("graphql:groups_index", "graphql:groups_index:#{current_organization.id}:org_groups_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:followed_hotspots_groups", "graphql:followed_hotspots_groups:#{current_organization.id}:org_groups_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:followed_hotspot_table", "graphql:followed_hotspot_table:#{current_organization.id}:hotspot_group_update", %{})

      conn
      |> put_resp_header("message", "#{group.name} deleted successfully")
      |> send_resp(:no_content, "")
    end
  end

  def update(conn, %{"id" => id, "group" => group_params}) do
    current_organization = conn.assigns.current_organization
    group = Groups.get_group!(current_organization, id)
    name = group.name

    with {:ok, %Group{} = group} <- Groups.update_group(group, group_params) do
      ConsoleWeb.Endpoint.broadcast("graphql:groups_index", "graphql:groups_index:#{current_organization.id}:org_groups_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:followed_hotspots_groups", "graphql:followed_hotspots_groups:#{current_organization.id}:org_groups_update", %{})

      msg =
        cond do
          group.name == name -> "Group #{group.name} updated successfully"
          true -> "The group #{name} was successfully updated to #{group.name}"
        end

      conn
      |> put_resp_header("message", msg)
      |> render("show.json", group: group)
    end
  end

  def add_hotspot_to_group(conn, %{ "group_id" => group_id, "hotspot_id" => hotspot_id } = attrs) do
    current_organization = conn.assigns.current_organization
    Groups.get_group!(current_organization, group_id)
    Hotspots.get_hotspot_by_id!(hotspot_id)

    with {:ok, %HotspotGroup{}} <- Groups.add_hotspot_to_group(attrs) do
      ConsoleWeb.Endpoint.broadcast("graphql:followed_hotspot_table", "graphql:followed_hotspot_table:#{current_organization.id}:hotspot_group_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:groups_index", "graphql:groups_index:#{current_organization.id}:org_groups_update", %{})
      conn
        |> put_resp_header("message", "Hotspot added to Group")
        |> send_resp(:no_content, "")
    end
  end

  def remove_hotspot_from_group(conn, %{ "group_id" => group_id, "hotspot_id" => hotspot_id } = attrs) do
    current_organization = conn.assigns.current_organization
    Groups.get_group!(current_organization, group_id)
    Hotspots.get_hotspot_by_id!(hotspot_id) 

    with {:ok, %HotspotGroup{}} <- Groups.remove_hotspot_from_group(attrs) do
      ConsoleWeb.Endpoint.broadcast("graphql:followed_hotspot_table", "graphql:followed_hotspot_table:#{current_organization.id}:hotspot_group_update", %{})
      ConsoleWeb.Endpoint.broadcast("graphql:groups_index", "graphql:groups_index:#{current_organization.id}:org_groups_update", %{})
      conn
        |> put_resp_header("message", "Hotspot removed from Group")
        |> send_resp(:no_content, "")
    end
  end

end