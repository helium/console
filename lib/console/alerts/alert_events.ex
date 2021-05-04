defmodule Console.AlertEvents do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Alerts.AlertEvent
  alias Console.Alerts

  def create_alert_event(attrs \\ %{}) do
    %AlertEvent{}
    |> AlertEvent.changeset(attrs)
    |> Repo.insert()
  end

  defp get_prev_node_alert_events(event, node_id, node_type, datetime_since, alert_id) do
    from(ae in AlertEvent,
      select: fragment("count(*)"),
      where: ae.reported_at >= ^datetime_since # TODO does this make sense?
        and ae.event == ^event
        and ae.node_id == ^node_id
        and ae.node_type == ^node_type
        and ae.alert_id == ^alert_id
      )
     |> Repo.one()
  end

  def notify_alert_event(node_id, node_type, event, details, limit \\ nil) do
    alerts =
      case details["label_id"] do
        nil -> Alerts.get_alerts_by_node_and_event(node_id, node_type, event)
        _ -> Alerts.get_alerts_by_node_and_event(details["label_id"], "group", event)
      end
    
    IO.puts "alerts: "
    IO.inspect alerts
    IO.puts "details: "
    IO.inspect details

    IO.puts "details[label_id]: #{details["label_id"]}"
    if length(alerts) > 0 do
      Enum.each(alerts, fn alert ->
        IO.puts "alert.id: #{alert.id}"
        # to prevent flapping due to some events that may be triggered too often,
        # check for prev alert events in queue or already sent
        restrict_to_prevent_flapping =
          case limit do
            %{ time_buffer: time_buffer } -> get_prev_node_alert_events(event, node_id, node_type, time_buffer, alert.id) > 0
            nil -> false
          end
        IO.puts restrict_to_prevent_flapping
        
        if not restrict_to_prevent_flapping do
          attrs = %{
            alert_id: alert.id,
            node_id: node_id,
            node_type: node_type,
            sent: false,
            event: event,
            details: details,
            reported_at: Timex.now
          }
          create_alert_event(attrs)
          Alerts.update_alert_last_triggered_at(alert)
        end
      end)
    end
  end

  def get_unsent_alert_events_since(datetime_since) do
    from(e in AlertEvent, where: e.reported_at >= ^datetime_since and e.sent == false)
     |> Repo.all()
  end

  def mark_alert_event_sent(%AlertEvent{} = alert_event) do
    alert_event |> AlertEvent.changeset(%{ sent: true }) |> Repo.update()
  end
end