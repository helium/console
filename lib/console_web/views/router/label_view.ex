defmodule ConsoleWeb.Router.LabelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.Router.LabelView
  alias ConsoleWeb.Router.FunctionView

  def render("show.json", %{label: label}) do
    render_one(label, LabelView, "label.json")
  end

  def render("label.json", %{label: label}) do
    %{
      id: label.id,
      name: label.name,
      organization_id: label.organization_id,
    }
    |> FunctionView.append_function(label.function)
  end

  def append_labels(json, labels) do
    labels_json = render_many(labels, LabelView, "label.json")
    Map.put(json, :labels, labels_json)
  end
end
