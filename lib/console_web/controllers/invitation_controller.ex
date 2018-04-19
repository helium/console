defmodule ConsoleWeb.InvitationController do
  use ConsoleWeb, :controller

  alias Console.Teams
  alias Console.Teams.Invitation
  alias Console.Teams.Membership
  alias Console.Auth
  alias Console.Email
  alias Console.Mailer

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_team = conn.assigns.current_team |> Teams.fetch_assoc([:invitations])
    render(conn, "index.json", invitations: current_team.invitations)
  end

  def create(conn, %{"invitation" => attrs}) do
    current_user = conn.assigns.current_user
    current_team = conn.assigns.current_team

    case Auth.user_exists?(attrs["email"]) do
      {true, existing_user} ->
        with {:ok, %Membership{} = membership} <-
               Teams.join_team(existing_user, current_team, attrs["role"]) do
          membership = membership |> Teams.fetch_assoc_membership()
          Email.joined_team_email(membership) |> Mailer.deliver_later()
          ConsoleWeb.MembershipController.broadcast(membership, "new")

          conn
          |> put_status(:created)
          |> put_view(ConsoleWeb.MembershipView)
          |> render("show.json", membership: membership)
        end

      false ->
        with {:ok, %Invitation{} = invitation} <-
               Teams.create_invitation(current_user, current_team, attrs) do
          Email.invitation_email(invitation) |> Mailer.deliver_later()
          broadcast(invitation, "new")

          conn
          |> put_status(:created)
          |> render("show.json", invitation: invitation)
        end
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
      |> redirect(
        to: "/register?invitation=#{token}&team_name=#{team_name}&inviter=#{inviter_email}"
      )
    else
      {false, _} ->
        conn
        |> put_flash(:error, "This invitation is no longer valid")
        |> redirect(to: "/register")
        |> halt()
    end
  end

  def delete(conn, %{"id" => id}) do
    invitation = Teams.get_invitation!(id)

    if invitation.pending do
      with {:ok, %Invitation{}} <- Teams.delete_invitation(invitation) do
        broadcast(invitation, "delete")
        send_resp(conn, :no_content, "")
      end
    else
      {:error, :forbidden, "Cannot remove an invitation that has already been used"}
    end
  end

  def broadcast(%Invitation{} = invitation, action) do
    invitation = invitation |> Teams.fetch_assoc_invitation()
    body = ConsoleWeb.InvitationView.render("show.json", invitation: invitation)
    ConsoleWeb.Endpoint.broadcast("invitation:#{invitation.team_id}", action, body)
  end
end
