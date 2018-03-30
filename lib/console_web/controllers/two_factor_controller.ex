defmodule ConsoleWeb.TwoFactorController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User
  alias Console.Auth.TwoFactor

  action_fallback ConsoleWeb.FallbackController

  def new(conn, _params) do
    secret = :crypto.strong_rand_bytes(16) |> Base.encode32 |> binary_part(0, 16)
    conn
    |> put_status(:ok)
    |> render("2fa_new.json", secret: secret)
  end

  def create(conn, %{"user" => %{"code" => code, "userId" => userId, "secret2fa" => secret2fa}}) do
    with %User{} = user <- Auth.get_user_by_id!(userId) do
      case :pot.valid_totp(code, secret2fa) do
        true ->
          with {:ok, %TwoFactor{} = userTwoFactor} <- Auth.enable_2fa(user, secret2fa) do
            conn
            |> put_status(:accepted)
            |> render("2fa_status.json", message: "Your account now has 2FA", user: user, backup_codes: userTwoFactor.backup_codes)
          end
        false -> {:error, :unauthorized, "The verification code you have entered is invalid, please try again"}
      end
    end
  end

  def verify(conn, %{"session" => %{"code" => code, "userId" => userId}}) do
    with %User{} = user <-  Auth.get_user_by_id!(userId) do
      loadedUser = Auth.fetch_assoc(user)
      userTwoFactor = loadedUser.twofactor

      validAuthCode = :pot.valid_totp(code, userTwoFactor.secret)
      validBackupCode = Enum.member?(userTwoFactor.backup_codes, code)

      cond do
        (validAuthCode or (validBackupCode and Auth.remove_used_backup_code(userTwoFactor, code))) == true ->
          with jwt <- Auth.generate_session_token(user) do
            conn
            |> put_status(:created)
            |> render("2fa_show.json", jwt: jwt, email: user.email)
          end
        (validBackupCode or validBackupCode) == false -> {:error, :unauthorized, "The verification code you have entered is invalid, please try again"}
      end
    end
  end
end
