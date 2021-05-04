defmodule Console.Jobs do
  # This module defines the jobs to be ran by Quantum scheduler 
  # as defined in config/config.exs

  alias Console.LabelNotificationEvents
  alias Console.Email
  alias Console.Mailer
  alias Console.LabelNotificationSettings
  alias Console.LabelNotificationWebhooks
  alias Console.Labels
  alias Console.Organizations
  alias Console.Devices
  alias Console.Events
  alias Console.Alerts
  alias Console.AlertEvents
  alias Console.Repo

  def send_alert do
    # to avoid spamming customers with multiple notifications for the same event, get notifications in 5-min batches
    now = Timex.now
    buffer = -5
    alertable_events = AlertEvents.get_unsent_alert_events_since(Timex.shift(now, minutes: buffer))

    # send emails for this batch, grouped by event type and label
    Enum.each(Enum.group_by(alertable_events, &Map.take(&1, [:alert_id, :event])), fn {identifiers, events} -> 
      # send_specific_event_email(identifiers, events) 
      # send_webhook(identifiers, events)
      IO.puts "HERE!!!!!"
      IO.inspect identifiers
      IO.inspect events
    end)

    Enum.each(alertable_events, fn e -> AlertEvents.mark_alert_event_sent(e) end)
  end

  def send_specific_event_email(identifiers, events) do
    label_notification_settings = LabelNotificationSettings.get_label_notification_setting_by_label_and_key(identifiers.label_id, identifiers.key)
    # continue w/ email if the setting for the specific label and key exist and are turned on ("1")
    if label_notification_settings != nil and Integer.parse(label_notification_settings.value) do
      # based on settings, prepare info needed for email
      label = Labels.get_label(identifiers.label_id)
      organization = Organizations.get_organization(label.organization_id)
      roles = case label_notification_settings.recipients do
        "admin" -> ["admin"]
        "manager" -> ["manager"]
        "read" -> ["read"]
        "all" -> ["admin", "manager", "read"]
      end
      recipients = Organizations.get_memberships_by_organization_and_role(label.organization_id, roles) |> Enum.map(fn (member) -> member.email end)
      details = Enum.map(events, fn (e) -> e.details end)
      has_hotspot_info = case Enum.find(details, fn d -> d["hotspot"] !== nil end) do
        nil -> false
        _ -> true
      end

      # send email specific to the type of event
      case identifiers.key do
        "device_deleted" -> Email.device_deleted_notification_email(recipients, label.name, details, organization.name, label.id) |> Mailer.deliver_later()
        "integration_with_devices_deleted" -> Email.integration_with_devices_deleted_notification_email(recipients, label.name, details, organization.name, label.id) |> Mailer.deliver_later()
        "integration_with_devices_updated" -> Email.integration_with_devices_updated_notification_email(recipients, label.name, details, organization.name, label.id) |> Mailer.deliver_later()
        "device_join_otaa_first_time" -> Email.device_join_otaa_first_time_notification_email(recipients, label.name, details, organization.name, label.id, has_hotspot_info) |> Mailer.deliver_later()
        "integration_stops_working" -> Email.integration_stops_working_notification_email(recipients, label.name, details, organization.name, label.id) |> Mailer.deliver_later()
        "device_stops_transmitting" -> Email.device_stops_transmitting_notification_email(recipients, label.name, details, organization.name, label.id, has_hotspot_info) |> Mailer.deliver_later()
        "downlink_unsuccessful" -> Email.downlink_unsuccessful_notification_email(recipients, label.name, details, organization.name, label.id) |> Mailer.deliver_later()
        "integration_receives_first_event" -> Email.integration_receives_first_event_notification_email(recipients, label.name, details, organization.name, label.id) |> Mailer.deliver_later()
      end
    end
  end

  def send_webhook(identifiers, events) do
    label_notification_webhooks = LabelNotificationWebhooks.get_label_notification_webhook_by_label_and_key(identifiers.label_id, identifiers.key)

    if label_notification_webhooks != nil and Integer.parse(label_notification_webhooks.value) do
      label = Labels.get_label(identifiers.label_id)
      organization = Organizations.get_organization(label.organization_id)

      # sanitize events by removing __meta__ field which causes JSON serializing differences on request end
      sanitized_events = Enum.map(events, fn e -> Map.delete(Map.from_struct(e), :__meta__) end)
      
      payload = Poison.encode!(sanitized_events)
      headers = [
        {"X-Helium-Hmac-SHA256", :crypto.hmac(:sha256, organization.webhook_key, payload) |> Base.encode64(padding: true)},
        {"Content-Type", "application/json"}
      ]
      HTTPoison.post(label_notification_webhooks.url, payload, headers)
    end
  end

  def delete_sent_notifications do 
    # since events are kept as "sent" so we can check against flapping, delete them in 24-hr batches
    buffer = -24
    LabelNotificationEvents.delete_sent_label_notification_events_since(Timex.shift(Timex.now, hours: buffer))
  end

  def trigger_device_stops_transmitting do
    alerts = Alerts.get_alerts_by_event("device_stops_transmitting") |> Repo.preload([:alert_nodes])
    
    Enum.each(alerts, fn alert ->
      alert_nodes = alert.alert_nodes

      # value in the config determines period of time to check if device stopped connecting
      email_config_value = alert.config["device_stops_transmitting"]["email"]["value"]
      webhook_config_value = alert.config["device_stops_transmitting"]["webhook"]["value"]

      Enum.each(alert_nodes, fn an ->
        if email_config_value != nil do
          buffer = email_config_value
          check_device_stop_transmitting(an.node_id, an.node_type, Timex.shift(Timex.now, minutes: -buffer))
        end

        if webhook_config_value != nil && webhook_config_value != email_config_value do
          buffer = webhook_config_value
          check_device_stop_transmitting(an.node_id, an.node_type, Timex.shift(Timex.now, minutes: -buffer))
        end
      end)
    end)
  end

  defp check_device_stop_transmitting(node_id, node_type, starting_from) do
    devices =
      case node_type do
        "device" ->
          [Devices.get_device(node_id)]
        "group" ->
          Devices.get_devices_for_label(node_id)
      end

    Enum.each(devices, fn device ->
      if device.last_connected != nil and Timex.compare(device.last_connected, starting_from) == -1 do
        # since we are already iterating by label to begin with, don't include all device's labels to iterate sending notifications by
        event = Events.get_device_last_event(device.id)
        { _, last_connected_time } = Timex.format(device.last_connected, "%m/%d/%y %H:%M:%S UTC", :strftime)
        details = %{
          device_name: device.name, 
          device_id: device.id,
          time: last_connected_time,
          hotspot: case event.data["hotspot"] != nil do
            false -> nil
            true -> event.data["hotspot"]
          end
        }

        details =
          case node_type do
            "group" -> Map.put(details, "label_id", node_id)
            _ -> details
          end

        limit = %{ time_buffer: Timex.shift(Timex.now, hours: -24) }

        AlertEvents.notify_alert_event(device.id, "device", "device_stops_transmitting", details, limit)
      end
    end)
  end
end