defmodule ConsoleWeb.PageController do
  use ConsoleWeb, :controller

  action_fallback ConsoleWeb.FallbackController

  def index(conn, _params) do
    render conn, "index.html"
  end
end
