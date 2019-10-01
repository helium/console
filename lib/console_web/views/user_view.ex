defmodule ConsoleWeb.UserView do
  use ConsoleWeb, :view
  alias ConsoleWeb.UserView

  def render("current.json", %{user: user, membership: membership}) do
    %{
      email: user.email,
      role: membership.role
    }
  end

  def render("show.json", %{user: user}) do
    %{data: render_one(user, UserView, "user.json")}
  end

  def render("user.json", %{user: user}) do
    %{email: user.email}
  end

  def render("user_status.json", %{message: message, email: email}) do
    %{success_message: message, email: email}
  end
end
