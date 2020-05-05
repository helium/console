defmodule ConsoleWeb.InvitationController do
  use ConsoleWeb, :controller

  alias Console.Organizations
  alias Console.Organizations
  alias Console.Organizations.Invitation
  alias Console.Organizations.Membership
  alias Console.Auth
  alias Console.Email
  alias Console.Mailer

  plug ConsoleWeb.Plug.AuthorizeAction when action not in [:accept, :redirect_to_register, :get_by_token]

  action_fallback(ConsoleWeb.FallbackController)

  def index(conn, _params) do
    current_organization = conn.assigns.current_organization |> Organizations.fetch_assoc([:invitations])
    render(conn, "index.json", invitations: current_organization.invitations)
  end

  def create(conn, %{"invitation" => attrs}) do
    current_user = conn.assigns.current_user
    organization = Organizations.get_organization!(current_user, attrs["organization"])

    with {:ok, %Invitation{} = invitation} <-
      Organizations.create_invitation(current_user, organization, attrs) do
      Email.invitation_email(invitation, current_user, organization) |> Mailer.deliver_later()
      broadcast(invitation)

      conn
      |> put_status(:created)
      |> put_resp_header("message", "Invitation sent")
      |> render("show.json", invitation: invitation)
    end
  end

  def redirect_to_register(conn, %{"token" => token}) do
    with {true, %Invitation{} = inv} <- Organizations.valid_invitation_token?(token) do
      conn
      |> redirect(
        to: "/register?invitation=#{token}"
      )
    else
      {false, _} ->
        conn
        |> put_flash(:error, "This invitation is no longer valid")
        |> redirect(to: "/register")
        |> halt()
    end
  end

  def accept(conn, %{"invitation" => %{"token" => invitation_token}}) do
    with {true, invitation} <- Organizations.valid_invitation_token_and_lock?(invitation_token) do
      organization = Organizations.get_organization!(invitation.organization_id)
      Organizations.join_organization(conn.assigns.current_user, organization, invitation.role)
      Organizations.mark_invitation_used(invitation)

      Organizations.get_invitation!(invitation.id)
      |> ConsoleWeb.InvitationController.broadcast()

      Organizations.get_membership!(conn.assigns.current_user, organization)
      |> ConsoleWeb.MembershipController.broadcast()

      conn
      |> put_status(:ok)
      |> render("accept.json", organization: organization)
    end
  end

  def get_by_token(conn, %{"token" => token}) do
    with {true, %Invitation{} = inv} <- Organizations.valid_invitation_token?(token) do
      inv = Organizations.fetch_assoc_invitation(inv)
      organization = inv.organization
      organization_name = URI.encode(organization.name)

      render(conn, "invitation.json", invitation: inv, organization_name: organization_name)
    end
  end

  def delete(conn, %{"id" => id}) do
    current_user = conn.assigns.current_user
    invitation = Organizations.get_invitation!(id)
    organization = Organizations.get_organization!(current_user, invitation.organization_id)

    if invitation.pending do
      with {:ok, %Invitation{}} <- Organizations.delete_invitation(invitation) do
        broadcast(invitation)

        conn
        |> put_resp_header("message", "Invitation removed")
        |> send_resp(:no_content, "")
      end
    else
      {:error, :forbidden, "Cannot remove an invitation that has already been used"}
    end
  end

  def broadcast(%Invitation{} = invitation) do
    invitation = invitation |> Organizations.fetch_assoc_invitation()

    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, invitation, invitation_updated: "#{invitation.organization_id}/invitation_updated")
  end
end
