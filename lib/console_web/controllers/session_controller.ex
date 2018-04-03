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

      if user.twofactor !== nil and Auth.datetime_over_24h_ago?(user.twofactor.last_verified) do
        conn
        |> put_status(:created)
        |> render("show.json", user: user)
      else
        conn
        |> put_status(:created)
        |> render("show.json", user: user, jwt: jwt, skip2fa: !Auth.datetime_over_24h_ago?(user.last_2fa_skipped_at))
        # TODO: why jwt if twofactor?
      end
    end
  end
end
