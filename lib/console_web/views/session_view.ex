defmodule ConsoleWeb.SessionView do
  use ConsoleWeb, :view

  def render("show.json", %{user: user, jwt: jwt, secret: secret}) do
    %{
      jwt: jwt,
      user: %{
        id: user.id,
        email: user.email,
        secret2fa: secret,
        twoFactorEnabled: false
      }
    }
  end
end
