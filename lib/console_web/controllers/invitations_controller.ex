defmodule ConsoleWeb.InvitationController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Invitation
  alias Console.Teams.Membership
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
    else {:ok, %Membership{} = membership} ->
      membership = membership |> Teams.fetch_assoc_membership()
      # Email.joined_team_email(membership) |> Mailer.deliver_later()
      conn
      |> put_status(:created)
      |> put_view(ConsoleWeb.MembershipView)
      |> render("show.json", membership: membership)
    end
  end

  def accept(conn, %{"token" => token}) do
    with {true, %Invitation{} = inv} <- Teams.valid_invitation_token?(token) do
      inv = Teams.fetch_assoc_invitation(inv)
      team = inv.team
      team_name = URI.encode(team.name)
      inviter = inv.inviter
      inviter_email = URI.encode(inviter.email)

      conn
      |> redirect(to: "/register?invitation=#{token}&team_name=#{team_name}&inviter=#{inviter_email}")
    else {false, _} ->
      conn
      |> put_flash(:error, "This invitation is no longer valid")
      |> redirect(to: "/register")
      |> halt()
    end
  end

end
