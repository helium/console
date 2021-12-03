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
      cf_list_enabled: label.cf_list_enabled,
      config_profile_id: label.config_profile_id
    }
  end

  def append_labels(json, labels) do
    labels = Enum.map(labels, fn l -> put_config_settings_on_label(l) end)
    labels_json = render_many(labels, LabelView, "label.json")
    Map.put(json, :labels, labels_json)
  end

  defp put_config_settings_on_label(label) do
    adr_allowed =
      case label.config_profile do
        nil -> nil
        _ -> label.config_profile.adr_allowed
      end

    cf_list_enabled =
      case label.config_profile do
        nil -> nil
        _ -> label.config_profile.cf_list_enabled
      end

    Map.merge(label, %{ cf_list_enabled: cf_list_enabled, adr_allowed: adr_allowed })
  end
end
