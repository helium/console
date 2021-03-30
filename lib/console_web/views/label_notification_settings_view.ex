defmodule ConsoleWeb.LabelNotificationSettingsView do
  use ConsoleWeb, :view

  def render("label_notification_settings.json", %{ label_notification_settings: label_notification_settings }) do
    %{
      settings: label_notification_settings
    }
  end
end
