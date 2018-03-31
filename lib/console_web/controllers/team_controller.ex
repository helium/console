defmodule ConsoleWeb.TeamController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Team
  alias Console.Auth

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    current_user = ConsoleWeb.Guardian.current_user(conn)
                   |> Console.Auth.fetch_assoc()
    render(conn, "index.json", teams: current_user.teams)
  end

  def show(conn, %{"id" => id}) do
    current_user = ConsoleWeb.Guardian.current_user(conn)
    team = Teams.get_team!(current_user, id)
    render(conn, "show.json", team: team)
  end

  def create(conn, %{"team" => team_attrs}) do
    current_user = ConsoleWeb.Guardian.current_user(conn)
    with {:ok, %Team{} = team} <- Teams.create_team(current_user, team_attrs) do
      conn
      |> put_status(:created)
      |> render("show.json", team: team)
    end
  end

  def switch(conn, %{"team_id" => team_id}) do
    current_user = ConsoleWeb.Guardian.current_user(conn)
    team = Teams.get_team!(current_user, team_id)
    jwt = Auth.generate_session_token(current_user, team)

    render(conn, "switch.json", jwt: jwt)
  end
end
