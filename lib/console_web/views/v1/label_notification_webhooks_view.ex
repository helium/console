defmodule ConsoleWeb.V1.LabelNotificationWebhooksView do
  use ConsoleWeb, :view

  def render("label_notification_webhooks.json", %{ label_notification_webhooks: label_notification_webhooks }) do
    %{
      webhook_setting: label_notification_webhooks
    }
  end
end