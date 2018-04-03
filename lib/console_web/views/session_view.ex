defmodule ConsoleWeb.SessionView do
  use ConsoleWeb, :view

  def render("show.json", %{user: user, jwt: jwt, skip2fa: skip}) do
    %{
      jwt: jwt,
      skip2fa: skip,
      user: %{
        id: user.id,
        twoFactorEnabled: user.twofactor !== nil
      }
    }
  end

  def render("show.json", %{user: user}) do
    %{
      user: %{
        id: user.id,
        twoFactorEnabled: true
      }
    }
  end
end
