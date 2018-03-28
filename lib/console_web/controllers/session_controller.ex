defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"session" => session_params, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
      {:ok, %User{} = user, jwt} <- Auth.authenticate(session_params) do
        conn
        |> put_status(:created)
        |> render("show.json", user: user, jwt: jwt)
    end
  end
end
