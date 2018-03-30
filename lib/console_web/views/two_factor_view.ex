defmodule ConsoleWeb.TwoFactorView do
  use ConsoleWeb, :view

  def render("2fa_show.json", %{jwt: jwt, email: email}) do
    %{jwt: jwt, email: email}
  end

  def render("2fa_status.json", %{message: message, user: user}) do
    %{
      success_message: message,
      user: %{
        id: user.id,
        twoFactorEnabled: true
      }
    }
  end
end
