defmodule ConsoleWeb.V1.OrganizationController do
  use ConsoleWeb, :controller

  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def show(conn, _) do
    render(conn, "show.json", organization: conn.assigns.current_organization)
  end
end
