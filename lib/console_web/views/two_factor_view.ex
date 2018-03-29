defmodule ConsoleWeb.TwoFactorView do
  use ConsoleWeb, :view

  def render("user_status.json", %{message: message, email: email}) do
    %{success_message: message, email: email}
  end
end
