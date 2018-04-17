defmodule ConsoleWeb.MembershipView do
  use ConsoleWeb, :view
  alias ConsoleWeb.MembershipView

  def render("show.json", %{membership: membership}) do
    render_one(membership, MembershipView, "membership.json")
  end

  def render("membership.json", %{membership: membership}) do
    %{
      id: membership.id,
      email: membership.user.email,
      role: membership.role,
      joined_at: membership.inserted_at,
      type: "memberships"
    }
  end

  def append_memberships(json, memberships) do
    if Ecto.assoc_loaded?(memberships) do
      memberships_json = render_many(memberships, MembershipView, "membership.json")
      Map.put(json, :memberships, memberships_json)
    else
      json
    end
  end
end
