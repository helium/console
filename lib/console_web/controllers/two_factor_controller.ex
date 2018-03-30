defmodule ConsoleWeb.TwoFactorController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"user" => %{"code" => code, "userId" => userId, "secret2fa" => secret2fa}}) do
    with %User{} = user <- Auth.get_user_by_id!(userId) do
      case :pot.valid_totp(code, secret2fa) do
        true ->
          with {:ok, _} <- Auth.enable_2fa(user, secret2fa) do
            # Generate backup codes and send back here
            conn
            |> put_status(:accepted)
            |> render("2fa_status.json", message: "Your account now has 2FA", user: user)
          end
        false -> {:error, :unauthorized, "The verification code you have entered is invalid, please try again"}
      end
    end
  end

  def verify(conn, %{"session" => %{"code" => code, "userId" => userId}}) do
    with %User{} = user <-  Auth.get_user_by_id!(userId) do
      loadedUser = Auth.fetch_assoc(user)
      case :pot.valid_totp(code, loadedUser.twofactor.secret) do
        true ->
          with jwt <- Auth.generate_session_token(user) do
            conn
            |> put_status(:created)
            |> render("2fa_show.json", jwt: jwt, email: user.email)
          end
        false -> {:error, :unauthorized, "The verification code you have entered is invalid, please try again"}
      end
    end
  end
end
