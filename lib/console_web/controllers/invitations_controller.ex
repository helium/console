defmodule ConsoleWeb.InvitationController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Invitation

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"invitation" => attrs}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team

    with {:ok, %Invitation{} = invitation} <- Teams.create_invitation(current_user, current_team, attrs) do
      conn
      |> put_status(:created)
      |> render("show.json", invitation: invitation)
    end
  end

end
