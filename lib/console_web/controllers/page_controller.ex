defmodule ConsoleWeb.PageController do
  use ConsoleWeb, :controller

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    render conn, "index.html"
  end

  def secret(conn, _params) do
    # secret = :crypto.strong_rand_bytes(16) |> Base.encode32 |> binary_part(0, 16)
    # test = :pot.valid_totp("954220", "GDJWVBSGXAC36OBQ")
    # IO.inspect test

    user = ConsoleWeb.Guardian.Plug.current_resource(conn)
    conn
      |> render("secret.json", user: user)
  end
end
