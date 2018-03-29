defmodule ConsoleWeb.TwoFactorView do
  use ConsoleWeb, :view

  def render("2fa_show.json", %{jwt: jwt, email: email}) do
    %{jwt: jwt, email: email}
  end

  def render("2fa_status.json", %{message: message, email: email}) do
    %{success_message: message, email: email}
  end
end
