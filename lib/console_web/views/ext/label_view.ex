defmodule ConsoleWeb.Ext.LabelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Ext.LabelView

  def render("index.json", %{labels: labels}) do
    render_many(labels, LabelView, "label.json")
  end

  def render("show.json", %{label: label}) do
    render_one(label, LabelView, "label.json")
  end

  def render("label.json", %{label: label}) do
    %{
      id: label.id,
      name: label.name,
    }
  end
end
