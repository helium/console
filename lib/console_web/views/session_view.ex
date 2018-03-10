defmodule ConsoleWeb.SessionView do
  use ConsoleWeb, :view
  alias ConsoleWeb.SessionView

  def render("show.json", %{user: user, jwt: jwt}) do
    %{
      jwt: jwt,
      user: %{
        id: user.id,
        email: user.email
      }
    }
  end
end
