defmodule ConsoleWeb.InvitationView do
  use ConsoleWeb, :view
  alias ConsoleWeb.InvitationView

  def render("index.json", %{invitations: invitations}) do
    render_many(invitations, InvitationView, "invitation.json")
  end

  def render("show.json", %{invitation: invitation}) do
    render_one(invitation, InvitationView, "invitation.json")
  end

  def render("invitation.json", %{invitation: invitation}) do
    %{
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      pending: invitation.pending,
      type: "invitations",
      sent_at: invitation.inserted_at
    }
  end

  def append_invitations(json, invitations) do
    if Ecto.assoc_loaded?(invitations) do
      invitations_json = render_many(invitations, InvitationView, "invitation.json")
      Map.put(json, :invitations, invitations_json)
    else
      json
    end
  end
end
