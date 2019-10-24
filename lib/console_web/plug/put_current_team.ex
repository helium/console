defmodule ConsoleWeb.Plug.PutCurrentTeam do
  alias Console.Teams
  alias Console.Teams.Membership
  alias Console.Teams.Organizations

  import Plug.Conn, only: [assign: 3, send_resp: 3, halt: 1]

  def init(default), do: default

  def call(conn, _default) do
    case ConsoleWeb.Guardian.Plug.current_claims(conn) do
      %{"team" => team_id, "organization" => organization_id} ->
        current_user = conn.assigns.current_user

        if current_user.super do
          team = Teams.get_team!(team_id)
          organization = Organizations.get_organization!(organization_id)
          membership = %Membership{ role: "admin" }

          conn
          |> assign(:current_team, team)
          |> assign(:current_organization, organization)
          |> assign(:current_membership, membership)
        else
          case Organizations.get_organization_team(current_user, team_id) do
            { current_team, current_organization } ->
              current_membership = Organizations.get_membership!(current_user, current_organization)

              conn
              |> assign(:current_team, current_team)
              |> assign(:current_organization, current_organization)
              |> assign(:current_membership, current_membership)
            _ ->
              conn
              |> send_resp(
                :forbidden,
                Poison.encode!(%{
                  type: "forbidden_team",
                  errors: ["You don't have access to this team"]
                })
              )
              |> halt()
          end
        end
      _ ->
        conn
    end
  end
end
