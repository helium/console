defmodule ConsoleWeb.TeamController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Team
  alias Console.Teams.Organization
  alias Console.Teams.Organizations
  alias Console.Auth
  alias Console.AuditTrails

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_user = conn.assigns.current_user |> Console.Auth.fetch_assoc()
    case current_user.organizations do
      [] ->
        render(conn, "index.json", teams: current_user.teams)
      _ ->
        teams = current_user.organizations
          |> Enum.map(fn o -> Organizations.fetch_assoc(o).teams end)
          |> List.flatten()
        render(conn, "index.json", teams: teams)
    end
  end

  def show(conn, %{"id" => id}) do
    team = Teams.get_team!(conn.assigns.current_user, id)
           |> Teams.fetch_assoc([:invitations, memberships: [:user]])
    render(conn, "show.json", team: team)
  end

  def create(conn, %{"team" => team_attrs, "organization" => %{ "id" => id } }) do
    with %Organization{} = organization <- Organizations.get_organization(conn.assigns.current_user, id),
      {:ok, %Team{} = team} <- Teams.create_team(conn.assigns.current_user, team_attrs, organization) do

      conn
      |> put_status(:created)
      |> render("show.json", team: team)
    end
  end

  def create(conn, %{"team" => team_attrs}) do
    with {:ok, %Team{} = team} <- Teams.create_team(conn.assigns.current_user, team_attrs) do

      conn
      |> put_status(:created)
      |> render("show.json", team: team)
    end
  end

  def switch(conn, %{"team_id" => team_id}) do
    team = Teams.get_team!(team_id)

    result =
      case team.organization_id do
        nil ->
          Teams.get_team!(conn.assigns.current_user, team_id)
        _ ->
          { current_team, current_organization } = Organizations.get_organization_team(conn.assigns.current_user, team_id)
          current_team
      end

    jwt = Auth.generate_session_token(conn.assigns.current_user, result)
    render(conn, "switch.json", jwt: jwt)
  end
end
