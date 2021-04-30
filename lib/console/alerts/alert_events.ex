defmodule Console.AlertEvents do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Console.Alerts.AlertEvent
  alias Console.AlertEvents
  alias Console.Alerts

  def create_alert_event(attrs \\ %{}) do
    %AlertEvent{}
    |> AlertEvent.changeset(attrs)
    |> Repo.insert()
  end

  defp get_prev_node_alert_events(event, node_id, node_type, datetime_since) do
    from(ae in AlertEvent,
      select: fragment("count(*)"),
      where: ae.reported_at >= ^datetime_since # TODO does this make sense?
        and ae.event == ^event
        and ae.node_id == ^node_id
        and ae.node_type == ^node_type
      )
     |> Repo.one()
  end

  defp get_prev_node_alert_events(event, device_id, node_id, node_type, datetime_since) do
    from(ae in AlertEvent,
      select: fragment("count(*)"),
      where: ae.reported_at >= ^datetime_since # TODO does this make sense?
        and ae.event == ^event
        and ae.node_id == ^node_id
        and ae.node_type == ^node_type
        and fragment("details ->> 'device_id' = ?", ^device_id)
      )
     |> Repo.one()
  end

  def notify_alert_event(node_id, node_type, event, details, limit \\ nil) do
    # to prevent flapping due to some events may be triggered too often,
    # check for prev alerts in queue or already sent
    restrict_to_prevent_flapping =
      case limit do
        %{ device_id: device_id, time_buffer: time_buffer } -> get_prev_node_alert_events(event, device_id, node_id, node_type, time_buffer) > 0 # for label alerts
        %{ time_buffer: time_buffer } -> get_prev_node_alert_events(event, node_id, node_type, time_buffer) > 0
        nil -> false
      end

    alerts = Alerts.get_alerts_by_node_and_event(node_id, node_type, event)
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
        create_alert_event(attrs)
        Alerts.update_alert_last_triggered_at(alert)
      end)
    end
  end
end