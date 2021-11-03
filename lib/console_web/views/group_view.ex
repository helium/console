defmodule ConsoleWeb.GroupView do
  use ConsoleWeb, :view
  alias ConsoleWeb.GroupView

  def render("show.json", %{group: group}) do
    render_one(group, GroupView, "group.json")
  end

  def render("group.json", %{group: group}) do
    %{
      id: group.id,
      name: group.name,
      organization_id: group.organization_id,
    }
  end
end
