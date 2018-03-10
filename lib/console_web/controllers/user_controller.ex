defmodule ConsoleWeb.UserController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User

  action_fallback ConsoleWeb.FallbackController

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Auth.create_user(user_params) do
      conn
      |> put_status(:created)
      |> render("show.json", user: user)
    end
  end
end
