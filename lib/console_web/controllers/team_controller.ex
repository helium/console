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
    teams =
      case current_user.super do
        true ->
          Teams.list_teams()
        _ ->
          teams = current_user.organizations
            |> Enum.map(fn o -> Organizations.fetch_assoc(o).teams end)
            |> List.flatten()
      end

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
      |> put_resp_header("message",  "#{team.name} created successfully")
      |> render("show.json", team: team)
    end
  end

  def create(conn, %{"team" => team_attrs, "organization" => %{ "name" => organization_name } }) do
    case team_attrs["name"] do
      "" ->
        {:error, :unprocessable_entity, "Team Name is required"}
      _ ->
        with {:ok, %Organization{} = organization} <- Organizations.create_organization(conn.assigns.current_user, %{ "name" => organization_name }),
          {:ok, %Team{} = team} <- Teams.create_team(conn.assigns.current_user, team_attrs, organization) do

          organizations = Organizations.get_organizations(conn.assigns.current_user)
          case Enum.count(organizations) do
            1 ->
              jwt = Auth.generate_session_token(conn.assigns.current_user, organization)
              render(conn, "switch.json", jwt: jwt)
            _ ->
              broadcast(organization, conn.assigns.current_user, "create")

              conn
              |> put_status(:created)
              |> put_resp_header("message",  "#{organization.name} created successfully")
              |> render("show.json", team: team)
          end
        end
    end
  end

  def switch_org(conn, %{"team_id" => id}) do
    if conn.assigns.current_user.super do
      with %Organization{} = organization <- Organizations.get_organization!(id) do
        jwt = Auth.generate_session_token(conn.assigns.current_user, organization)
        render(conn, "switch.json", jwt: jwt)
      end
    else
      with %Organization{} = organization <- Organizations.get_organization(conn.assigns.current_user, id) do
        jwt = Auth.generate_session_token(conn.assigns.current_user, organization)
        render(conn, "switch.json", jwt: jwt)
      end
    end
  end

  def switch(conn, %{"team_id" => team_id}) do
    current_organization = conn.assigns.current_organization
    team = Teams.get_team!(team_id)
    with true <- team.organization_id == current_organization.id do
      jwt = Auth.generate_session_token(conn.assigns.current_user, current_organization, team)
      render(conn, "switch.json", jwt: jwt)
    end
  end

  def delete(conn, %{"id" => id}) do
    with { %Team{} = team, %Organization{} } <- Organizations.get_organization_team(conn.assigns.current_user, id),
      {:ok, %Team{} = team} <- Teams.delete_team(team) do
        broadcast(team, "delete")

        conn
        |> put_status(:accepted)
        |> put_resp_header("message",  "#{team.name} deleted successfully")
        |> render("show.json", team: team)
    end
  end

  def delete_organization(conn, %{"id" => id}) do
    organization = Organizations.get_organization!(conn.assigns.current_user, id)
    teams = Organizations.fetch_assoc(organization, [:teams]).teams
    with {:ok, %Organization{} = organization} <- Organizations.delete_organization(organization) do
      broadcast(organization, conn.assigns.current_user, "delete")

      conn
      |> put_status(:accepted)
      |> put_resp_header("message",  "#{organization.name} deleted successfully")
      |> render("index.json", teams: teams)
    end
  end

  defp broadcast(%Team{} = team, _) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, team, team_added: "#{team.organization_id}/team_added")
  end

  defp broadcast(%Organization{} = organization, current_user, _) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, organization, organization_added: "#{current_user.id}/organization_added")
  end
end
