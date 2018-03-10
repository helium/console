defmodule ConsoleWeb.PageView do
  use ConsoleWeb, :view

  def render("secret.json", %{}) do
    %{ secret: "something secret" }
  end
end
