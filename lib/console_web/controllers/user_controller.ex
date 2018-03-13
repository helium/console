defmodule ConsoleWeb.UserController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User

  alias Console.Email
  alias Console.Mailer

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"user" => user_params}) do
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
      |> put_flash(:info, "Email verification link is not valid, please check your email or request a new verification link")
      |> redirect(to: "/login")
      |> halt()
    end
  end
end
