defmodule ConsoleWeb.UserController do
  use ConsoleWeb, :controller

  alias Console.Auth
  alias Console.Auth.User
  alias Console.Organizations
  alias Console.Organizations.Organization
  alias Console.Organizations.Invitation

  alias Console.Email
  alias Console.Mailer

  action_fallback ConsoleWeb.FallbackController

  def current(conn, _params) do
    user = conn.assigns.current_user
    membership = Map.get(conn.assigns, :current_membership)
    case membership do
      nil ->
        conn
          |> render("current.json", user: user)
      _ ->
        conn
          |> render("current.json", user: user, membership: membership)
    end
  end

  # Registration via signing up with org name
  def create(conn, %{"user" => user_params, "organization" => organization_params}) do
    with {:ok, %User{} = user, %Organization{} = organization} <- Auth.create_user(user_params, organization_params) do
      conn
      |> put_status(:created)
      |> render("show.json", user: user)
    end
  end
end
