defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User
  alias Console.Auth.TwoFactor

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"session" => session_params, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
      {:ok, %User{} = user, jwt} <- Auth.authenticate(session_params) do
        case user.twofactor do
          nil ->
            conn
            |> put_status(:created)
            |> render("show.json", user: user, jwt: jwt)
          %TwoFactor{} ->
            conn
            |> put_status(:created)
            |> render("show.json", user: user)
        end
    end
  end
end
