defmodule Console.LabelNotificationEvents do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.LabelNotificationEvent
  
  def get_label_notification_event!(id), do: Repo.get!(LabelNotificationEvent, id)
  def get_label_notification_event(id), do: Repo.get(LabelNotificationEvent, id)

  def create_label_notification_event(attrs \\ %{}) do
    %LabelNotificationEvent{}
    |> LabelNotificationEvent.changeset(attrs)
    |> Repo.insert()
  end

  def get_unsent_label_notification_events_since(datetime_since) do
    from(e in LabelNotificationEvent, where: e.reported_at >= ^datetime_since and e.sent == false)
     |> Repo.all()
  end

  def mark_label_notification_events_sent(%LabelNotificationEvent{} = label_notification_event) do
    label_notification_event |> LabelNotificationEvent.changeset(%{ sent: true }) |> Repo.update()
  end

  def delete_sent_label_notification_events_since(datetime_since) do
    from(e in LabelNotificationEvent, where: e.reported_at >= ^datetime_since and e.sent == true) |> Repo.delete_all()
  end
end