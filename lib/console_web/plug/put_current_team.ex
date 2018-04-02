defmodule ConsoleWeb.Plug.PutCurrentTeam do
  import Plug.Conn, only: [assign: 3]

  def init(default), do: default

  def call(conn, _default) do
    %{"team" => team_id} = ConsoleWeb.Guardian.Plug.current_claims(conn)
    current_user = conn.assigns.current_user
    current_team = Console.Teams.get_team!(current_user, team_id)
    assign(conn, :current_team, current_team)
  end
end
