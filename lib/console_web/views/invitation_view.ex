defmodule ConsoleWeb.InvitationView do
  use ConsoleWeb, :view
  alias ConsoleWeb.InvitationView

  def render("show.json", %{invitation: invitation}) do
    render_one(invitation, InvitationView, "invitation.json")
  end

  def render("invitation.json", %{invitation: invitation}) do
    %{
      id: invitation.id,
      email: invitation.email,
      role: invitation.role
    }
  end
end
