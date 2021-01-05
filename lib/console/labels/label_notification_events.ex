defmodule Console.LabelNotificationEvents do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.LabelNotificationEvent
  alias Console.LabelNotificationSettings
  
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

  def notify_label_event(trigger, event_key, details) do
    Enum.each(trigger.labels, fn label_id -> 
      settings = LabelNotificationSettings.get_label_notification_setting_by_label_and_key(label_id, event_key)
      if settings != nil and Integer.parse(settings.value) do
        attrs = %{
          label_id: label_id,
          sent: false,
          key: event_key,
          reported_at: Timex.now,
          details: details
        }
        create_label_notification_event(attrs) 
      end
    end)
  end
end