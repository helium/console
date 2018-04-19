defmodule ConsoleWeb.MembershipController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Membership

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
      render(conn, "show.json", membership: membership)
    end
  end

  def delete(conn, %{"id" => id}) do
    membership = Teams.get_membership!(id)

    with {:ok, %Membership{}} <- Teams.delete_membership(membership) do
      broadcast(membership, "delete")
      send_resp(conn, :no_content, "")
    end
  end

  def broadcast(%Membership{} = membership, action) do
    membership = membership |> Teams.fetch_assoc_membership()
    body = ConsoleWeb.MembershipView.render("show.json", membership: membership)
    ConsoleWeb.Endpoint.broadcast("membership:#{membership.team_id}", action, body)
  end
end
