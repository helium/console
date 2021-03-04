defmodule ConsoleWeb.LabelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.LabelView

  def render("show.json", %{label: label}) do
    render_one(label, LabelView, "label.json")
  end

  def render("label.json", %{label: label}) do
    %{
      id: label.id,
      name: label.name,
      organization_id: label.organization_id,
    }
  end
end
