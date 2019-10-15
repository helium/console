defmodule ConsoleWeb.Plug.PutCurrentTeam do
  alias Console.Teams
  alias Console.Teams.Membership
  alias Console.Teams.Organizations

  import Plug.Conn, only: [assign: 3, send_resp: 3]

  def init(default), do: default

  def call(conn, _default) do
    case ConsoleWeb.Guardian.Plug.current_claims(conn) do
      %{"team" => team_id, "organization" => organization_id} ->
        current_user = conn.assigns.current_user

        cond do
          current_user.super ->
            team = Teams.get_team!(team_id)
            organization = Organizations.get_organization!(organization_id)
            membership = %Membership{ role: "admin" }

            conn
            |> assign(:current_team, team)
            |> assign(:current_organization, organization)
            |> assign(:current_membership, membership)
          { current_team, current_organization } = Organizations.get_organization_team(current_user, team_id) ->
            current_membership = Organizations.get_membership!(current_user, current_organization)

            conn
            |> assign(:current_team, current_team)
            |> assign(:current_organization, current_organization)
            |> assign(:current_membership, current_membership)
          true ->
            conn
            |> send_resp(
              :forbidden,
              Poison.encode!(%{
                type: "forbidden_team",
                errors: ["You don't have access to this team"]
              })
            )
        end
      _ ->
        conn
    end
  end
end
