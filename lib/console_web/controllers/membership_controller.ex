defmodule ConsoleWeb.MembershipController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Organizations
  alias Console.Teams.Membership
  alias Console.Auth

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_organization = conn.assigns.current_organization |> Organizations.fetch_assoc([memberships: [:user]])
    render(conn, "index.json", memberships: current_organization.memberships)
  end

  def update(conn, %{"id" => id, "membership" => attrs}) do
    membership = Organizations.get_membership!(id)

    with {:ok, %Membership{} = membership} <- Organizations.update_membership(membership, attrs) do
      membership = membership |> Organizations.fetch_assoc_membership()
      broadcast(membership, "update")

      conn
      |> put_resp_header("message", "User role updated successfully")
      |> render("show.json", membership: membership)
    end
  end

  def delete(conn, %{"id" => id}) do
    membership = Organizations.get_membership!(id)

    with {:ok, %Membership{}} <- Organizations.delete_membership(membership) do
      broadcast(membership, "delete")

      conn
      |> put_resp_header("message", "User removed from team")
      |> send_resp(:no_content, "")
    end
  end

  def broadcast(%Membership{} = membership, _) do
    membership = membership |> Organizations.fetch_assoc_membership()
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, membership, membership_added: "#{membership.organization.id}/membership_added")
  end
end
