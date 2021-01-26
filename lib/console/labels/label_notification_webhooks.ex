defmodule Console.LabelNotificationWebhooks do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.LabelNotificationWebhook

  def get_label_notification_webhook!(id), do: Repo.get!(LabelNotificationWebhook, id)
  def get_label_notification_webhook(id), do: Repo.get(LabelNotificationWebhook, id)

  def delete(multi, label_notification_webhook_key, label_id) do
    queryable = from(ns in LabelNotificationWebhook, where: ns.key == ^label_notification_webhook_key and ns.label_id == ^label_id)
    Ecto.Multi.delete_all(multi, :delete_all, queryable)
  end

  def upsert(multi, attrs \\ %{}) do
    Ecto.Multi.insert(multi, attrs["key"], LabelNotificationWebhook.changeset(%LabelNotificationWebhook{}, attrs), on_conflict: {:replace, [:url, :notes]}, conflict_target: [:key, :label_id])
  end
end 