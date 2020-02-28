defmodule ConsoleWeb.MembershipView do
  use ConsoleWeb, :view
  alias ConsoleWeb.MembershipView

  def render("index.json", %{memberships: memberships}) do
    render_many(memberships, MembershipView, "membership.json")
  end

  def render("show.json", %{membership: membership}) do
    render_one(membership, MembershipView, "membership.json")
  end

  def render("membership.json", %{membership: membership}) do
    %{
      id: membership.id,
      role: membership.role,
      joined_at: membership.inserted_at,
      type: "memberships"
    }
  end
end
