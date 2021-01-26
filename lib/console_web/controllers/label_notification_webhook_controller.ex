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
    result = webhooks
    |> Enum.reduce(Ecto.Multi.new, fn (webhook, multi) -> 
      case webhook["value"] do
        "0" -> LabelNotificationWebhooks.delete(multi, webhook["key"], webhook["label_id"])
        _ -> LabelNotificationWebhooks.upsert(multi, webhook) 
      end
    end)
    |> Repo.transaction

    case result do
      {:ok, _} -> 
        label = Labels.get_label(List.first(webhooks)["label_id"])
        label = Repo.preload(label, [:label_notification_webhooks])
        broadcast(label, label.id)
  
        conn
        |> put_resp_header("message", "The label notification webhooks were successfully updated")
        |> render("label_notification_webhooks.json", label_notification_webhooks: webhooks)
      {:error, _, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  defp broadcast(%Label{} = label, id) do
    Absinthe.Subscription.publish(ConsoleWeb.Endpoint, label, label_updated: "#{label.organization_id}/#{id}/label_updated")
  end
end 