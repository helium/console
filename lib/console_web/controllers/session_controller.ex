defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User
  alias Console.Teams.Organizations
  alias Console.AuditTrails

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"session" => session_params, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
         {:ok, %User{} = user} <- Auth.authenticate(session_params),
         current_organization <- Organizations.current_organization_for(user),
         jwt <- Auth.generate_session_token(user, current_organization) do

      if user.twofactor do
        conn
        |> put_status(:created)
        |> render("show.json", user: user)
      else
        conn
        |> put_status(:created)
        |> render("show.json", user: user, jwt: jwt, skip2fa: !Auth.should_skip_2fa_prompt?(user.last_2fa_skipped_at))
        # TODO: why jwt if twofactor?
      end
    end
  end

  def refresh(conn, %{"jwt" => jwt}) do
    with {:ok, {newToken, _claims}} <- Auth.refresh_session_token(jwt) do
      conn
      |> put_status(:created)
      |> render("refresh.json", jwt: newToken)
    end
  end
end
