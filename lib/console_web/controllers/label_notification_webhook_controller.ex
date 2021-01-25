defmodule ConsoleWeb.LabelNotificationWebhooksController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Labels.LabelNotificationWebhook
  alias Console.LabelNotificationWebhooks
  alias Console.Labels
  alias Console.Labels.Label

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def update(conn, %{"label_notification_webhooks" => webhooks}) do
    with {:ok, :ok} <- Repo.transaction(fn ->
      Enum.each(webhooks, fn webhook -> 
        case webhook["value"] do
          "0" -> LabelNotificationWebhooks.delete_label_notification_webhook_by_key_and_label(webhook["key"], webhook["label_id"])
          _ -> LabelNotificationWebhooks.upsert_label_notification_webhook(webhook)
        end
      end)
    end)
    do
      label = Labels.get_label(List.first(webhooks)["label_id"])
      label = Repo.preload(label, [:label_notification_webhooks])
      broadcast(label, label.id)

      conn
      |> put_resp_header("message", "The label notification webhooks were successfully updated")
      |> render("label_notification_webhooks.json", label_notification_webhooks: webhooks)
    end
  end

  defp broadcast(%Label{} = label, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_updated: "#{label.organization_id}/#{id}/label_updated")
  end
end 