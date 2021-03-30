defmodule ConsoleWeb.PageController do
  use ConsoleWeb, :controller

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    render conn, "index.html"
  end

  def google_verify(conn, _params) do
    conn
    |> put_layout(false)
    |> render("google.html")
  end
end
