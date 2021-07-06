defmodule ConsoleWeb.V1.LabelView do
  use ConsoleWeb, :view
  alias ConsoleWeb.V1.LabelView

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
      adr_allowed: label.adr_allowed,
      cf_list_enabled: label.cf_list_enabled
    }
  end

  def append_labels(json, labels) do
    labels_json = render_many(labels, LabelView, "label.json")
    Map.put(json, :labels, labels_json)
  end
end
