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

  # TODO make private
  def get_prev_integration_label_notification_events(key, integration_id, datetime_since) do
    from(e in LabelNotificationEvent, select: fragment("count(*)"), where: e.reported_at >= ^datetime_since and e.key == ^key and fragment("details ->> 'channel_id' = ?", ^integration_id))
      |> Repo.one()
  end

  # TODO make private
  def get_prev_device_label_notification_events(key, device_id, datetime_since) do
    from(e in LabelNotificationEvent, select: fragment("count(*)"), where: e.reported_at >= ^datetime_since and e.key == ^key and fragment("details ->> 'device_id' = ?", ^device_id))
     |> Repo.one()
  end

  def mark_label_notification_events_sent(%LabelNotificationEvent{} = label_notification_event) do
    label_notification_event |> LabelNotificationEvent.changeset(%{ sent: true }) |> Repo.update()
  end

  def delete_sent_label_notification_events_since(datetime_since) do
    from(e in LabelNotificationEvent, where: e.reported_at >= ^datetime_since and e.sent == true) |> Repo.delete_all()
  end

  def delete_label_events_for_device(device_id) do
    from(e in LabelNotificationEvent, where: e.key == "device_stops_transmitting" and fragment("details ->> 'device_id' = ?", ^device_id)) |> Repo.delete_all()
  end

  def notify_label_event(labels, event_key, details, limit \\ nil) do
    # to prevent flapping due to some events may be triggered too often,
    # check for prev notifications (specific to the device or integration) in queue or already sent
    restrict_to_prevent_flapping = 
      case limit do
        %{ device_id: device_id, time_buffer: time_buffer } -> get_prev_device_label_notification_events(event_key, device_id, time_buffer) > 0
        %{ integration_id: integration_id, time_buffer: time_buffer } -> get_prev_integration_label_notification_events(event_key, integration_id, time_buffer) > 0
        nil -> false
      end

    if not restrict_to_prevent_flapping do
      Enum.each(labels, fn label_id -> 
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
end