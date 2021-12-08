defmodule ConsoleWeb.MembershipController do
  use ConsoleWeb, :controller

  alias Console.Organizations

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def update(conn, %{"id" => id, "membership" => attrs}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    membership = Organizations.get_membership!(current_organization, id)

    if current_user.id == membership.user_id do
      {:error, :forbidden, "Cannot update your own membership"}
    else
      with {:ok, _} <- Organizations.update_membership(membership, attrs) do
        ConsoleWeb.Endpoint.broadcast("graphql:members_table", "graphql:members_table:#{conn.assigns.current_organization.id}:member_list_update", %{})

        conn
        |> put_resp_header("message", "User role updated successfully")
        |> render("show.json", membership: membership)
      end
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization
    current_user = conn.assigns.current_user
    membership = Organizations.get_membership!(current_organization, id)

    if current_user.id == membership.user_id do
      {:error, :forbidden, "Cannot delete your own membership"}
    else
      with {:ok, _} <- Organizations.delete_membership(membership) do
        ConsoleWeb.Endpoint.broadcast("graphql:members_table", "graphql:members_table:#{conn.assigns.current_organization.id}:member_list_update", %{})

        case Organizations.get_invitation(current_organization, membership.email) do
          nil -> nil
          invitation -> Organizations.delete_invitation(invitation)
        end

        conn
        |> put_resp_header("message", "User removed from organization")
        |> send_resp(:no_content, "")
      end
    end
  end
end
