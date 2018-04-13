defmodule ConsoleWeb.InvitationController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Invitation
  alias Console.Email
  alias Console.Mailer

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"invitation" => attrs}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team

    with {:ok, %Invitation{} = invitation} <- Teams.create_invitation(current_user, current_team, attrs) do
      Email.invitation_email(invitation) |> Mailer.deliver_later()
      conn
      |> put_status(:created)
      |> render("show.json", invitation: invitation)
    end
  end

  def accept(conn, %{"token" => token}) do
    with true <- Teams.valid_invitation_token?(token) do
      conn
      |> redirect(to: "/register?invitation=#{token}")
    else false ->
      conn
      |> put_flash(:error, "This invitation is no longer valid")
      |> redirect(to: "/register")
      |> halt()
    end
  end

end
