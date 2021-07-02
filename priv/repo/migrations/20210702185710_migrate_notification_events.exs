defmodule Console.Repo.Migrations.MigrateNotificationEvents do
  use Ecto.Migration
  alias Console.Channels

  def cast_label_notification_event(record) do
    %{
      id: Enum.at(record, 0),
      reported_at: Enum.at(record, 1),
      key: Enum.at(record, 2),
      label_id: Enum.at(record, 3),
      details: Enum.at(record, 4),
      sent: Enum.at(record, 5),
      inserted_at: Enum.at(record, 6),
      updated_at: Enum.at(record, 7)
    }
  end

  def up do
    result = Ecto.Adapters.SQL.query!(Console.Repo, """
      SELECT id, reported_at, key, label_id, details, sent, inserted_at, updated_at FROM label_notification_events;
    """).rows
    
    for i <- result do
      old_row = cast_label_notification_event(i)
      node_id = cond do
        old_row.key in ["device_deleted", "device_join_otaa_first_time", "device_stops_transmitting", "downlink_unsuccessful"] ->
          old_row.label_id
        true ->
          channel = Channels.get_channel(old_row.details["channel_id"])
          {:ok, channel_id} = Ecto.UUID.dump(channel.id)
          channel_id
      end

      node_type = cond do
        old_row.key in ["device_deleted", "device_join_otaa_first_time", "device_stops_transmitting", "downlink_unsuccessful"] ->
          "label"
        true ->
          "integration"
      end

      email_settings_results = Ecto.Adapters.SQL.query!(Console.Repo, """
        SELECT id FROM label_notification_settings WHERE key = $1 AND label_id = $2
      """, [old_row.key, old_row.label_id]).rows

      if Enum.count(email_settings_results) > 0 do 
        Ecto.Adapters.SQL.query!(
          Console.Repo, """
            WITH alerts_query AS (
              SELECT a.id AS alert_id 
              FROM alerts a 
                LEFT JOIN alert_nodes an ON a.id = an.alert_id 
              WHERE an.node_id = $3
            )
              INSERT INTO alert_events(id, reported_at, alert_id, node_id, node_type, details, sent, inserted_at, updated_at, type, event)
                SELECT $1, $2, aq.alert_id, $3, $4, $5, $6, $7, $8, 'email', $9 FROM alerts_query aq;
          """,
          [
            old_row.id,
            old_row.reported_at,
            node_id,
            node_type,
            old_row.details,
            old_row.sent,
            old_row.inserted_at,
            old_row.updated_at,
            old_row.key
          ]
        )
      end

      webhook_settings_results = Ecto.Adapters.SQL.query!(Console.Repo, """
        SELECT id FROM label_notification_webhooks WHERE key = $1 AND label_id = $2
      """, [old_row.key, old_row.label_id]).rows

      if Enum.count(webhook_settings_results) > 0 do
        uuid = cond do
          Enum.count(email_settings_results) > 0 ->
            {:ok, id} = Ecto.UUID.dump(Ecto.UUID.generate())
            id
          true -> old_row.id
        end

        Ecto.Adapters.SQL.query!(
          Console.Repo, """
            WITH alerts_query AS (
              SELECT a.id AS alert_id 
              FROM alerts a 
                LEFT JOIN alert_nodes an ON a.id = an.alert_id 
              WHERE an.node_id = $3
            )
              INSERT INTO alert_events(id, reported_at, alert_id, node_id, node_type, details, sent, inserted_at, updated_at, type, event)
                SELECT $1, $2, aq.alert_id, $3, $4, $5, $6, $7, $8, 'webhook', $9 FROM alerts_query aq;
          """,
          [
            uuid,
            old_row.reported_at,
            node_id,
            node_type,
            old_row.details,
            old_row.sent,
            old_row.inserted_at,
            old_row.updated_at,
            old_row.key
          ]
        )
      end
    end
  end

  def down do
    Ecto.Adapters.SQL.query!(Console.Repo, """
      DELETE FROM alert_events;
    """)
  end
end
