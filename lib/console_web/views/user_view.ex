defmodule ConsoleWeb.UserView do
  use ConsoleWeb, :view
  alias ConsoleWeb.UserView

  def render("show.json", %{user: user}) do
    %{data: render_one(user, UserView, "user.json")}
  end

  def render("user.json", %{user: user}) do
    %{email: user.email}
  end

  def render("user_status.json", %{action: action, email: email}) do
    %{action: action, email: email, status: "success"}
  end
end
