defmodule ConsoleWeb.InvitationController do
  use ConsoleWeb, :controller

  alias Console.Organizations
  alias Console.Organizations.Invitation
  alias Console.Email
  alias Console.Mailer
  alias Console.Repo

  plug ConsoleWeb.Plug.AuthorizeAction when action not in [:accept, :redirect_to_register, :get_by_token, :get_by_email, :resend_invitation]

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"invitation" => attrs}) do
    current_user = conn.assigns.current_user
    current_organization = conn.assigns.current_organization
    organization = Organizations.get_organization!(current_user, attrs["organization"])

    if current_organization.id == organization.id and current_user.email != attrs["email"] do
      with {:ok, %{ invitation: invitation, user: _ }} <-
        Organizations.create_invitation(current_user, organization, attrs) do
        Email.invitation_email(invitation, current_user, organization) |> Mailer.deliver_later()
        ConsoleWeb.Endpoint.broadcast("graphql:invitations_table", "graphql:invitations_table:#{conn.assigns.current_organization.id}:invitation_list_update", %{})

        conn
        |> put_status(:created)
        |> put_resp_header("message", "Invitation sent")
        |> render("show.json", invitation: invitation)
      end
    else
      {:error, :forbidden, "You don't have access to do this"}
    end
  end

  def redirect_to_register(conn, %{"token" => token}) do
    with {true, %Invitation{} = _inv} <- Organizations.valid_invitation_token?(token) do
      conn
      |> redirect(
        to: "/join_organization?invitation=#{token}"
      )
    else
      {false, _} ->
        conn
        |> put_flash(:error, "This invitation is no longer valid")
        |> redirect(to: "/join_organization")
        |> halt()
    end
  end

  def accept(conn, %{"invitation" => %{"token" => invitation_token}}) do
    { true, invitation } = Organizations.valid_invitation_token?(invitation_token)

    if conn.assigns.current_user.id != invitation.inviter_id do
      with {true, invitation} <- Organizations.valid_invitation_token_and_lock?(invitation_token) do
        organization = Organizations.get_organization!(invitation.organization_id)

        join_result =
          Ecto.Multi.new()
          |> Ecto.Multi.run(:membership, fn _repo, _ ->
            Organizations.join_organization(conn.assigns.current_user, organization, invitation.role)
          end)
          |> Ecto.Multi.run(:used_invitation, fn _repo, _ ->
            Organizations.mark_invitation_used(invitation)
          end)
          |> Repo.transaction()

        with {:ok, %{ membership: membership, used_invitation: _ }} <- join_result do
          ConsoleWeb.Endpoint.broadcast("graphql:invitations_table", "graphql:invitations_table:#{organization.id}:invitation_list_update", %{})
          ConsoleWeb.Endpoint.broadcast("graphql:members_table", "graphql:members_table:#{organization.id}:member_list_update", %{})

          conn
          |> put_status(:ok)
          |> render("accept.json", %{organization: organization, membership: membership})
        end
      end
    end
  end

  def get_by_token(conn, %{"token" => token}) do
    with {true, %Invitation{} = inv} <- Organizations.valid_invitation_token?(token) do
      inv = Organizations.fetch_assoc_invitation(inv)
      organization = inv.organization
      organization_name = organization.name

      render(conn, "invitation.json", invitation: inv, organization_name: organization_name)
    else
      {false, _} ->
        conn
        |> send_resp(404, "Invalid invitation")
    end
  end

  def delete(conn, %{"id" => id}) do
    current_organization = conn.assigns.current_organization

    invitation = Organizations.get_invitation!(current_organization, id)

    if invitation.pending do
      with {:ok, %Invitation{}} <- Organizations.delete_invitation(invitation) do
        ConsoleWeb.Endpoint.broadcast("graphql:invitations_table", "graphql:invitations_table:#{conn.assigns.current_organization.id}:invitation_list_update", %{})

        conn
        |> put_resp_header("message", "Invitation removed")
        |> send_resp(:no_content, "")
      end
    else
      {:error, :forbidden, "Cannot remove an invitation that has already been used"}
    end
  end

  def get_by_email(conn, %{"email" => email}) do
     invitations = Organizations.get_invitations(email)

    conn
    |> put_status(:ok)
    |> render("index.json", invitations: invitations)
  end

  def resend_invitation(conn, %{"email" => email}) do 
    invitation = Organizations.get_latest_invitation(email)
    organization = Organizations.get_organization!(invitation.organization_id)
    inviter_email = Organizations.get_inviter_email(invitation.inviter_id)
    Email.resend_invitation_email(invitation, inviter_email, organization) |> Mailer.deliver_later()

    conn
      |> put_status(:ok)
      |> put_resp_header("message", "Invitation resent")
      |> render("show.json", invitation: invitation)
  end
end
