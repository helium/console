defmodule Console.AlertEvents do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Alerts.AlertEvent
  alias Console.Alerts
  alias Console.Labels
  alias Console.Devices

  def create_alert_event(attrs \\ %{}) do
    %AlertEvent{}
    |> AlertEvent.changeset(attrs)
    |> Repo.insert()
  end

  defp get_prev_node_alert_events(event, node_id, node_type, datetime_since, alert_id, type) do
    from(ae in AlertEvent,
      select: fragment("count(*)"),
      where: ae.reported_at >= ^datetime_since
        and ae.event == ^event
        and ae.node_id == ^node_id
        and ae.node_type == ^node_type
        and ae.alert_id == ^alert_id
        and ae.type == ^ type
      )
     |> Repo.one()
  end

  def notify_alert_event(node_id, node_type, event, details, label_ids \\ nil, limit \\ nil) do
    # device node triggers should create an alert event for every applicable (device or label) alert
    alerts =
      case label_ids do
        nil -> Alerts.get_alerts_by_node_and_event(node_id, node_type, event)
        _ ->
          Alerts.get_alerts_by_node_and_event(node_id, "device", event)
            ++ Alerts.get_alerts_by_label_node_and_event(label_ids, event)
      end
  
    if length(alerts) > 0 do
      Enum.each(alerts, fn alert ->
        attrs = %{
          alert_id: alert.id,
          node_id: node_id,
          node_type: node_type,
          sent: false,
          event: event,
          details: details,
          reported_at: Timex.now
        }

        alert_event_email_config = alert.config[event]["email"]

        if alert_event_email_config != nil do
          email_restrict_to_prevent_flapping =
            case limit do
              %{ time_buffer: time_buffer } -> get_prev_node_alert_events(event, node_id, node_type, time_buffer, alert.id, "email") > 0
              nil -> false
            end

          if not email_restrict_to_prevent_flapping do
            email_attrs = Map.put(attrs, :type, "email")
            if Map.has_key?(alert_event_email_config, "value") do
              if alert_event_email_config["value"] == details.buffer do
                create_alert_event(email_attrs)
              end
            else
              create_alert_event(email_attrs)
            end
          end
        end

        alert_event_webhook_config = alert.config[event]["webhook"]

        if alert_event_webhook_config != nil do
          webhook_restrict_to_prevent_flapping =
            case limit do
              %{ time_buffer: time_buffer } -> get_prev_node_alert_events(event, node_id, node_type, time_buffer, alert.id, "webhook") > 0
              nil -> false
            end

          if not webhook_restrict_to_prevent_flapping do
            webhook_attrs = Map.put(attrs, :type, "webhook")
            if Map.has_key?(alert_event_webhook_config, "value") do
              if alert_event_webhook_config["value"] == details.buffer do
                create_alert_event(webhook_attrs)
              end
            else
              create_alert_event(webhook_attrs)
            end
          end
        end

        Alerts.update_alert_last_triggered_at(alert)
      end)
    end
  end

  def get_unsent_alert_events_since(type, datetime_since) do
    from(ae in AlertEvent, where: ae.type == ^type and ae.reported_at >= ^datetime_since and ae.sent == false)
     |> Repo.all()
  end

  def mark_alert_event_sent(%AlertEvent{} = alert_event) do
    alert_event |> AlertEvent.changeset(%{ sent: true }) |> Repo.update()
  end

  def delete_sent_alert_events_since(datetime_since) do
    from(ae in AlertEvent, where: ae.reported_at >= ^datetime_since and ae.sent == true) |> Repo.delete_all()
  end

  def delete_unsent_alert_events_for_device(device_id) do
    from(ae in AlertEvent, where: ae.sent == false and ae.node_id == ^device_id and ae.node_type == "device") |> Repo.delete_all()
  end
  
  def delete_unsent_alert_events_for_integration(integration_id) do
    from(ae in AlertEvent, where: ae.sent == false and ae.node_id == ^integration_id and ae.node_type == "integration") |> Repo.delete_all()
  end
end