defmodule ConsoleWeb.UserController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User

  alias Console.Email
  alias Console.Mailer

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"user" => user_params, "recaptcha" => recaptcha}) do
    with {:ok, %User{} = user} <- Auth.create_user(user_params) do
      Email.confirm_email(user) |> Mailer.deliver_later()

      conn
      |> put_status(:created)
      |> render("show.json", user: user)
    end
  end

  def confirm_email(conn, %{"token" => token}) do
    with :ok <- Auth.confirm_email(token) do
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
    with {:ok, %User{} = user} <-  Auth.get_user_for_resend_verification(email) do
      Email.confirm_email(user) |> Mailer.deliver_later()

      conn
      |> put_status(:accepted)
      |> render("user_status.json", user: user)
    end
  end

  def forgot_password(conn, %{"email" => email, "recaptcha" => recaptcha}) do
    with {:ok, %User{} = user} <-  Auth.get_user_for_password_reset(email) do
      {:ok, token, _claims} = ConsoleWeb.Guardian.encode_and_sign(user, %{email: user.email}, token_type: "reset_password", ttl: {1, :hour})
      Email.password_reset_email(user, token) |> Mailer.deliver_later()

      conn
      |> put_status(:accepted)
      |> render("user_status.json", user: user)
    end
  end

  def reset_password(conn, %{"token" => token}) do
    with {:ok, _} <- ConsoleWeb.Guardian.decode_and_verify(token) do
      conn
      |> put_flash(:info, "Please choose a new password")
      |> redirect(to: "/reset_password/#{token}")
      |> halt()
    else {:error, _} ->
      conn
      |> put_flash(:error, "Password reset link is not valid, please check your email or request a new password reset link")
      |> redirect(to: "/login")
      |> halt()
    end
  end

  def change_password(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Auth.change_password(user_params) do
      conn
      |> put_status(:accepted)
      |> render("user_status.json", user: user)
    end
  end
end
