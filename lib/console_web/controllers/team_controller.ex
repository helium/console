defmodule ConsoleWeb.TeamController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Team

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"team" => team_attrs}) do
    current_user = ConsoleWeb.Guardian.current_user(conn)
    with {:ok, %Team{} = team} <- Teams.create_team(current_user, team_attrs) do
      conn
      |> put_status(:created)
      |> render("show.json", team: team)
    end
  end
end
