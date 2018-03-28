defmodule ConsoleWeb.SessionView do
  use ConsoleWeb, :view

  def render("show.json", %{user: user, jwt: jwt, secret: secret}) do
    %{
      jwt: jwt,
      user: %{
        id: user.id,
        secret2FA: secret,
        twoFactorEnabled: user.two_factor_enabled
      }
    }
  end

  def render("show.json", %{user: user, jwt: jwt}) do
    %{
      jwt: jwt,
      user: %{
        id: user.id,
        twoFactorEnabled: user.two_factor_enabled
      }
    }
  end

  def render("show.json", %{user: user}) do
    %{
      user: %{
        id: user.id,
        twoFactorEnabled: user.two_factor_enabled
      }
    }
  end
end
