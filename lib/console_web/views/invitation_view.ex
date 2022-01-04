defmodule ConsoleWeb.InvitationView do
  use ConsoleWeb, :view
  alias ConsoleWeb.InvitationView

  def render("index.json", %{invitations: invitations}) do
    render_many(invitations, InvitationView, "invitation.json")
  end

  def render("accept.json", %{organization: organization, membership: membership}) do
    [%{id: organization.id, name: organization.name, role: membership.role}]
  end

  def render("show.json", %{invitation: invitation}) do
    render_one(invitation, InvitationView, "invitation.json")
  end

  def render("invitation.json", %{invitation: invitation, organization_name: organization_name}) do
    %{
      email: invitation.email,
      organizationName: organization_name,
      inviter_id: invitation.inviter_id
    }
  end

  def render("invitation.json", %{invitation: invitation}) do
    %{
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      pending: invitation.pending,
      type: "invitations"
    }
  end
end
