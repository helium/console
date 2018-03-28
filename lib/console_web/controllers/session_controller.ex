defmodule ConsoleWeb.SessionController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"session" => session_params, "recaptcha" => recaptcha}) do
    with true <- Auth.verify_captcha(recaptcha),
      {:ok, %User{} = user, jwt} <- Auth.authenticate(session_params) do
        case user.two_factor_enabled do
          false ->
            secret = :crypto.strong_rand_bytes(16) |> Base.encode32 |> binary_part(0, 16)

            conn
            |> put_status(:created)
            |> render("show.json", user: user, jwt: jwt, secret: secret)
          true ->
            conn
            |> put_status(:created)
            |> render("show.json", user: user)
        end
    end
  end

  def verify_2fa(conn, %{"session" => %{"code" => code, "userId" => userId}}) do
    with %User{} = user <-  Auth.get_user_by_id!(userId) do
      case :pot.valid_totp(code, user.two_factor_secret) do
        true ->
          with jwt <- Auth.generate_session_token(user) do
            conn
            |> put_status(:created)
            |> render("show.json", user: user, jwt: jwt)
          end
        false -> {:error, :unauthorized, "The verification code you have entered is invalid, please try again"}
      end
    end
  end
end
