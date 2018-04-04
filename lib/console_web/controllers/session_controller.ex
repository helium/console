defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User
  alias Console.Teams

  action_fallback(ConsoleWeb.FallbackController)

  def create(conn, %{"session" => session_params, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
         {:ok, %User{} = user} <- Auth.authenticate(session_params),
         current_team <- Teams.current_team_for(user),
         jwt <- Auth.generate_session_token(user, current_team) do

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
    {:ok, _, {newToken, claim}} = ConsoleWeb.Guardian.refresh(jwt, ttl: { 1, :hour })
    conn
    |> put_status(:created)
    |> render("refresh.json", jwt: newToken)
  end
end
