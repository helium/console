defmodule ConsoleWeb.Router.SessionView do
  use ConsoleWeb, :view

  def render("show.json", %{jwt: jwt}) do
    %{
      jwt: jwt
    }
  end

  def render("secret.json", _params) do
    %{
      secret: "this is a secret"
    }
  end
end
