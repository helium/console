defmodule ConsoleWeb.LabelNotificationWebhooksView do
  use ConsoleWeb, :view
  alias ConsoleWeb.LabelNotificationWebhooksView
  alias Console.Labels.LabelNotificationWebhook

  def render("label_notification_webhooks.json", %{ label_notification_webhooks: label_notification_webhooks }) do
    %{
      webhooks: label_notification_webhooks
    }
  end
end