defmodule ConsoleWeb.LabelNotificationSettingsView do
  use ConsoleWeb, :view
  alias ConsoleWeb.LabelNotificationSettingsView
  alias Console.Labels.LabelNotificationSetting

  def render("show.json", %{label_notification_settings: label_notification_settings}) do
    render_one(label_notification_settings, LabelNotificationSettingsView, "label_notification_settings.json")
  end

  def render("label_notification_settings.json", %{ label_notification_settings: label_notification_settings }) do
    %{
      settings: label_notification_settings
    }
  end
end
