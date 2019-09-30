defmodule ConsoleWeb.UserController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User
  alias Console.Teams
  alias Console.Teams.Team
  alias Console.Teams.Organization
  alias Console.Teams.Organizations
  alias Console.Teams.Invitation
  alias Console.AuditTrails

  alias Console.Email
  alias Console.Mailer

  action_fallback ConsoleWeb.FallbackController

  def current(conn, _params) do
    user = conn.assigns.current_user
    membership = conn.assigns.current_membership

    current_organizations = Organizations.get_organizations(user)

    case length(current_organizations) > 0 do
      false ->
        conn
          |> render("current.json", user: user, membership: membership)
      true ->
        conn
          |> render("current.json", user: user, membership: membership, in_organization: true)
    end

    conn
      |> render("current.json", user: user, membership: membership)
  end

  # Registration via signing up with org name
  def create(conn, %{"user" => user_params, "team" => team_params, "recaptcha" => recaptcha, "organization" => organization_params}) do
    with true <- Auth.verify_captcha(recaptcha),
      {:ok, %User{} = user, %Team{} = team, %Organization{} = organization} <- Auth.create_org_user(user_params, team_params, organization_params) do

        conn
        |> handle_created(user)
    end
  end

  # Registration via signing up with just team name
  def create(conn, %{"user" => user_params, "team" => team_params, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
      {:ok, %User{} = user, %Team{} = team} <- Auth.create_user(user_params, team_params) do

        conn
        |> handle_created(user)
    end
  end

  # Registration via accepting invitation to team
  def create(conn, %{"user" => user_params, "recaptcha" => recaptcha, "invitation" => %{"token" => invitation_token}}) do
    with true <- Auth.verify_captcha(recaptcha),
      {true, invitation} <- Teams.valid_invitation_token?(invitation_token),
      {:ok, %User{} = user, %Invitation{} = invitation} <- Auth.create_user_via_invitation(invitation, user_params) do
        inviter = Auth.get_user_by_id!(invitation.inviter_id)
        team = Teams.get_team!(invitation.team_id)

        # notify clients that the invitation has been used
        Teams.get_invitation!(invitation.id)
        |> ConsoleWeb.InvitationController.broadcast("update")

        # notify clients of the new membership
        user = user |> Auth.fetch_assoc([:memberships])
        List.last(user.memberships)
        |> ConsoleWeb.MembershipController.broadcast("new")

        updatedUser = Map.merge(user, %{role: List.last(user.memberships).role})

        conn
        |> handle_created(user)
    end
  end

  defp handle_created(conn, %User{} = user) do
    Email.confirm_email(user) |> Mailer.deliver_later()

    conn
    |> put_status(:created)
    |> render("show.json", user: user)
  end

  def confirm_email(conn, %{"token" => token}) do
    with {:ok, %User{} = user} <- Auth.confirm_email(token) do

      conn
      |> put_flash(:info, "Email confirmed, you may now log in")
      |> redirect(to: "/login")
      |> halt()
    else :error ->
      conn
      |> put_flash(:error, "Email verification link is not valid, please check your email or request a new verification link")
      |> redirect(to: "/login")
      |> halt()
    end
  end

  def resend_verification(conn, %{"email" => email, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
      {:ok, %User{} = user} <-  Auth.get_user_for_resend_verification(email) do
        Email.confirm_email(user) |> Mailer.deliver_later()

        conn
        |> put_status(:accepted)
        |> render("user_status.json", message: "Your verification email has been resent, please check your email", email: user.email)
    end
  end

  def forgot_password(conn, %{"email" => email, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
      {:ok, %User{} = user} <-  Auth.get_user_for_password_reset(email) do
        {:ok, token, _claims} = ConsoleWeb.Guardian.encode_and_sign(user, %{email: user.email}, token_type: "reset_password", ttl: {1, :hour}, secret: user.password_hash)
        Email.password_reset_email(user, token) |> Mailer.deliver_later()

        conn
        |> put_status(:accepted)
        |> render("user_status.json", message: "Your password reset email has been sent, please check your email", email: user.email)
    end
  end

  def reset_password(conn, %{"token" => token}) do
    email =
      try do
        ConsoleWeb.Guardian.peek(token).claims["email"]
      rescue
        _ -> "invalid_token"
      end

    with {true, user} <- Auth.user_exists?(email),
      {:ok, _} <- ConsoleWeb.Guardian.decode_and_verify(token, %{}, secret: user.password_hash) do

        conn
        |> put_flash(:info, "Please choose a new password")
        |> redirect(to: "/reset_password/#{token}")
        |> halt()
    else _ ->
      conn
      |> put_flash(:error, "Password reset link is not valid, please check your email or request a new password reset link")
      |> redirect(to: "/login")
      |> halt()
    end
  end

  def change_password(conn, %{"user" => params}) do
    email =
      try do
        ConsoleWeb.Guardian.peek(params["token"]).claims["email"]
      rescue
        _ -> "invalid_token"
      end

    with {true, user} <- Auth.user_exists?(email),
      {:ok, %User{} = updatedUser} <- Auth.change_password(params, user.password_hash) do

        conn
        |> put_status(:accepted)
        |> render("user_status.json", message: "Your password has been changed successfully, please login with your new credentials", email: user.email)
    else _ ->
      {:error, :unauthorized, "Password reset link may have expired, please check your email or request a new password reset link"}
    end
  end
end
