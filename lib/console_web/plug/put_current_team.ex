defmodule ConsoleWeb.Plug.PutCurrentTeam do
  import Plug.Conn, only: [assign: 3, send_resp: 3]

  def init(default), do: default

  def call(conn, _default) do
    %{"team" => team_id} = ConsoleWeb.Guardian.Plug.current_claims(conn)
    current_user = conn.assigns.current_user

    if current_team = Console.Teams.get_team(current_user, team_id) do
      conn
      |> assign(:current_team, current_team)
    else
      conn
      |> send_resp(
        :forbidden,
        Poison.encode!(%{type: "forbidden_team", errors: ["You don't have access to this team"]})
      )
    end
  end
end
