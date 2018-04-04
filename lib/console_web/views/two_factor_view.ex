defmodule ConsoleWeb.TwoFactorView do
  use ConsoleWeb, :view

  def render("2fa_new.json", %{secret: secret}) do
    %{secret2fa: secret}
  end

  def render("2fa_show.json", %{jwt: jwt, email: email}) do
    %{jwt: jwt, email: email}
  end

  def render("2fa_status.json", %{message: message, user: user, backup_codes: codes}) do
    %{
      success_message: message,
      user: %{
        id: user.id,
        twoFactorEnabled: true,
        backup_codes: codes
      }
    }
  end

  def render("2fa_status.json", %{message: message}) do
    %{
      success_message: message
    }
  end
end
