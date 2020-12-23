defmodule Console.Jobs do
  # This module defines the jobs to be ran by Quantum scheduler 
  # as defined in config/config.exs

  def send_notification_emails do
    alias Console.LabelNotificationEvents

    # to avoid spamming customers with multiple notifications for the same event, get notifications in 5-min batches
    now = Timex.now
    buffer = -5
    notifiable_events = LabelNotificationEvents.get_unsent_label_notification_events_since(Timex.shift(now, minutes: buffer))

    # send emails for this batch, grouped by event type and label
    Enum.each(Enum.group_by(notifiable_events, &Map.take(&1, [:label_id, :key])), fn {identifiers, events} -> send_specific_event_email(identifiers, events) end)

    # mark these events as sent
    Enum.each(notifiable_events, fn e -> LabelNotificationEvents.mark_label_notification_events_sent(e) end)
  end

  def send_specific_event_email(identifiers, events) do
    alias Console.Email
    alias Console.Mailer
    alias Console.LabelNotificationSettings
    alias Console.Labels
    alias Console.Organizations

    label_notification_settings = LabelNotificationSettings.get_label_notification_setting_by_label_and_key(identifiers.label_id, identifiers.key)
    # continue w/ email if the setting for the specific label and key exist and are turned on ("1")
    if label_notification_settings != nil and Integer.parse(label_notification_settings.value) do
      # based on settings, prepare info needed for email
      label = Labels.get_label(identifiers.label_id)
      organization = Organizations.get_organization(label.organization_id)
      roles = case label_notification_settings.recipients do
        "admin" -> ["admin"]
        "manager" -> ["manager"]
        "both" -> ["admin", "manager"]
      end
      recipients = Organizations.get_memberships_by_organization_and_role(label.organization_id, roles) |> Enum.map(fn (member) -> member.email end)
      details = Enum.map(events, fn (e) -> e.details end)

      # send email specific to the type of event
      case identifiers.key do
        "device_deleted" -> Email.device_deleted_notification_email(recipients, label.name, details, organization.name, label.id) |> Mailer.deliver_later()
        "integration_with_devices_deleted" -> Email.integration_with_devices_deleted_notification_email() |> Mailer.deliver_later()
        "integration_with_devices_updated" -> Email.integration_with_devices_updated_notification_email() |> Mailer.deliver_later()
      end
    end
  end

  def delete_sent_notifications do 
    alias Console.LabelNotificationEvents
    # since events are kept as "sent" so we can check against flapping, delete them in 1-hr batches
    buffer = -1
    LabelNotificationEvents.delete_sent_label_notification_events_since(Timex.shift(Timex.now, hours: buffer))
  end
end