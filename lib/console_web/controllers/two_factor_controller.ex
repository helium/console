defmodule ConsoleWeb.TwoFactorController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User
  alias Console.Auth.TwoFactor
  alias Console.Teams
  alias Console.AuditTrails

  action_fallback(ConsoleWeb.FallbackController)

  def new(conn, _params) do
    secret = :crypto.strong_rand_bytes(16) |> Base.encode32() |> binary_part(0, 16)

    conn
    |> put_status(:ok)
    |> render("2fa_new.json", secret: secret)
  end

  def create(conn, %{"user" => %{"code" => code, "userId" => userId, "secret2fa" => secret2fa}}) do
    with %User{} = user <- Auth.get_user_by_id!(userId) do
      if Auth.verify_2fa_code(code, secret2fa) do
          codes = Auth.generate_backup_codes()
          with {:ok, %TwoFactor{}} <- Auth.enable_2fa(user, secret2fa, codes) do
            conn
            |> put_status(:accepted)
            |> render("2fa_status.json", message: "Your account now has 2FA", user: user, backup_codes: codes)
          end
      else
          {:error, :unauthorized, "The verification code you have entered is invalid, please try again"}
      end
    end
  end

  def verify(conn, %{"session" => %{"code" => code, "userId" => userId}}) do
    with %User{} = user <- Auth.get_user_by_id!(userId) do
      loadedUser = Auth.fetch_assoc(user)
      userTwoFactor = loadedUser.twofactor

      if Auth.verify_2fa_and_backup_codes(code, userTwoFactor) do
        with current_team <- Teams.current_team_for(user),
                      jwt <- Auth.generate_session_token(user, current_team),
                      {:ok, _} <- Auth.update_2fa_last_verification(userTwoFactor) do

          conn
          |> put_status(:created)
          |> render("2fa_show.json", jwt: jwt, email: user.email)
        end
      else
        {:error, :unauthorized, "The verification code you have entered is invalid, please try again"}
      end
    end
  end

  def skip(conn, %{"userId" => userId}) do
    with %User{} = user <- Auth.get_user_by_id!(userId),
      {:ok, _} = Auth.update_2fa_last_skipped(user) do

        conn
        |> put_status(:accepted)
        |> render("2fa_status.json", message: "You have skipped 2fa for 24 hours")
    end
  end
end
