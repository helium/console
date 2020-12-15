defmodule ConsoleWeb.LabelNotificationsSettingView do
  use ConsoleWeb, :view
  alias ConsoleWeb.LabelNotificationsSettingView

  def render("show.json", %{label_notification_settings: label_notification_settings}) do
    render_one(label_notification_settings, LabelNotificationsSettingView, "label_notification_settings.json")
  end

  def render("label_notification_settings.json", %{label_notification_settings: label_notification_settings}) do
    %{
      settings: label_notification_settings
    }
  end
end
