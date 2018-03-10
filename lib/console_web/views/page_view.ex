defmodule ConsoleWeb.PageView do
  use ConsoleWeb, :view

  def render("secret.json", %{user: user}) do
    %{ secret: "something secret",
       your_email: user.email }
  end
end
