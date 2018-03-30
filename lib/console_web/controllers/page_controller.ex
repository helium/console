defmodule ConsoleWeb.PageController do
  use ConsoleWeb, :controller

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    render conn, "index.html"
  end

  def secret(conn, _params) do
    user = ConsoleWeb.Guardian.Plug.current_resource(conn)
    conn
      |> render("secret.json", user: user)
  end
end
