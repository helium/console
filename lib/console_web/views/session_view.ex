defmodule ConsoleWeb.SessionView do
  use ConsoleWeb, :view

  def render("show.json", %{jwt: jwt, claims: claims}) do
    Map.put(claims, :__raw, jwt)
  end
end
