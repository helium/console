defmodule Console.LabelNotificationWebhooks do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.LabelNotificationWebhook

  def get_label_notification_webhook!(id), do: Repo.get!(LabelNotificationWebhook, id)
  def get_label_notification_webhook(id), do: Repo.get(LabelNotificationWebhook, id)

  def upsert_label_notification_webhook(attrs \\ %{}) do
    %LabelNotificationWebhook{}
    |> LabelNotificationWebhook.changeset(attrs)
    |> Repo.insert(conflict_target: [:key, :label_id], on_conflict: {:replace, [:url, :notes]})
  end

  def delete_label_notification_webhook_by_key_and_label(label_notification_webhook_key, label_id) do
    with {count, nil} <- from(ns in LabelNotificationWebhook, where: ns.key == ^label_notification_webhook_key and ns.label_id == ^label_id) |> Repo.delete_all() do
      {:ok, count}
    end
  end
end 