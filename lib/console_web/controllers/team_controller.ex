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
    teams = current_user.organizations
      |> Enum.map(fn o -> Organizations.fetch_assoc(o).teams end)
      |> List.flatten()
    render(conn, "index.json", teams: teams)
  end

  def show(conn, %{"id" => id}) do
    team = Teams.get_team!(conn.assigns.current_user, id)
           |> Teams.fetch_assoc([:invitations, memberships: [:user]])
    render(conn, "show.json", team: team)
  end

  def create(conn, %{"team" => team_attrs, "organization" => %{ "id" => id } }) do
    with %Organization{} = organization <- Organizations.get_organization(conn.assigns.current_user, id),
      {:ok, %Team{} = team} <- Teams.create_team(conn.assigns.current_user, team_attrs, organization) do
      broadcast(team, "create")

      conn
      |> put_status(:created)
      |> render("show.json", team: team)
    end
  end

  def switch(conn, %{"team_id" => team_id}) do
    current_organization = Map.get(conn.assigns, :current_organization)
    team = Teams.get_team!(team_id)
    with true <- team.organization_id == current_organization.id do
      jwt = Auth.generate_session_token(conn.assigns.current_user, current_organization, team)
      render(conn, "switch.json", jwt: jwt)
    end
  end

  defp broadcast(%Team{} = team, _) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, team, team_added: "#{team.organization_id}/team_added")
  end
end
