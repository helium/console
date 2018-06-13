defmodule ConsoleWeb.MembershipController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Membership
  alias Console.Auth
  alias Console.AuditTrails

  plug :put_auth_item when action in [:update, :delete]
  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_team = conn.assigns.current_team |> Teams.fetch_assoc([memberships: [:user]])
    render(conn, "index.json", memberships: current_team.memberships)
  end

  def update(conn, %{"id" => id, "membership" => attrs}) do
    membership = Teams.get_membership!(id)

    with {:ok, %Membership{} = membership} <- Teams.update_membership(membership, attrs) do
      membership = membership |> Teams.fetch_assoc_membership()
      broadcast(membership, "update")

      updatedUser = Map.merge(membership.user, %{role: membership.role})
      AuditTrails.create_audit_trail("team_membership", "update", conn.assigns.current_user, conn.assigns.current_team, "users", updatedUser)

      conn
      |> put_resp_header("message", "User role updated successfully")
      |> render("show.json", membership: membership)
    end
  end

  def delete(conn, %{"id" => id}) do
    membership = Teams.get_membership!(id)

    with {:ok, %Membership{}} <- Teams.delete_membership(membership) do
      broadcast(membership, "delete")

      updatedUser = Auth.get_user_by_id!(membership.user_id)
      AuditTrails.create_audit_trail("team_membership", "delete", conn.assigns.current_user, conn.assigns.current_team, "users", updatedUser)
      conn
      |> put_resp_header("message", "User removed from team")
      |> send_resp(:no_content, "")
    end
  end

  def broadcast(%Membership{} = membership, _) do
    membership = membership |> Teams.fetch_assoc_membership()

    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, membership, membership_added: "#{membership.team.id}/membership_added")
  end

  def put_auth_item(conn, _) do
    membership = Teams.get_membership!(conn.params["id"])

    conn
    |> assign(:auth_item, membership)
  end
end
