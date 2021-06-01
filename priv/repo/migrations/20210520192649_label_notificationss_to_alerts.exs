defmodule Console.Repo.Migrations.LabelNotificationssToAlerts do
  use Ecto.Migration
  alias Console.Alerts
  alias Console.Repo
  alias Console.Organizations
  alias Console.Labels

  def cast_email(record) do
    row = %{
      key: Enum.at(record, 0),
      label_id: Enum.at(record, 2),
      recipient: Enum.at(record, 3),
      organization_id: Enum.at(record, 4)
    }

    case Enum.at(record, 0) do
      "device_stops_transmitting" -> Map.put(row, :value, String.to_integer(Enum.at(record, 1)))
      _ -> row
    end
  end

  def cast_webhook(record) do
    row = %{
      key: Enum.at(record, 0),
      label_id: Enum.at(record, 2),
      url: Enum.at(record, 3),
      notes: Enum.at(record, 4),
      organization_id: Enum.at(record, 5)
    }

    case Enum.at(record, 0) do
      "device_stops_transmitting" -> Map.put(row, :value, String.to_integer(Enum.at(record, 1)))
      _ -> row
    end
  end

  def run_migration(type, events) do
    node_type = case type do
      "label" -> "device/label"
      _ -> type
    end

    email_sql = """
      SELECT s.key AS key, s.value AS value, s.label_id AS label_id, s.recipients AS recipients, l.organization_id AS organization_id 
        FROM label_notification_settings s LEFT JOIN labels l ON l.id = s.label_id 
          WHERE s.key = ANY($1)
    """
    results = Ecto.Adapters.SQL.query!(Console.Repo, email_sql, [events]).rows
    Enum.each(
      Enum.group_by(
        results |> Enum.map(&cast_email/1), &Map.take(&1, [:label_id, :organization_id])
      ), fn {x, y} ->
          {:ok, org_id} = Ecto.UUID.load(x.organization_id)
          {:ok, label_id} = Ecto.UUID.load(x.label_id)
          label = Labels.get_label(label_id)

          alert_name = case node_type do
            "device/label" -> "Alert for label #{label.name}"
            "integration" -> "Alert for label #{label.name}"
          end
          alert = Alerts.get_alert_by_name(org_id, alert_name)
          case alert do
            nil ->
              Ecto.Multi.new()
              |> Ecto.Multi.run(:alert, fn _repo, _ ->
                alert = Alerts.create_alert(%{
                  "name" => alert_name,
                  "organization_id" => org_id,
                  "node_type" => node_type,
                  "config" => Enum.into(Enum.map(y, fn setting ->
                    setting_map = %{
                      "recipient" => setting.recipient
                    }

                    setting_map = cond do
                      Map.has_key?(setting, :value) -> Map.put(setting_map, "value", setting.value)
                      true -> setting_map
                    end

                    {
                      "#{setting.key}",
                      %{"email" => setting_map}
                    }
                  end), %{})
                })
              end)
              |> Ecto.Multi.run(:alert_node, fn _repo, %{ alert: alert } ->
                org = Organizations.get_organization(org_id)
                Alerts.add_alert_node(org, alert, label_id, "label")
              end)
              |> Repo.transaction()
            _ ->
              config = alert.config

              Enum.each(y, fn setting ->
                setting_map = %{
                  "recipient" => setting.recipient
                }

                setting_map = cond do
                  Map.has_key?(setting, :value) -> Map.put(setting_map, "value", setting.value)
                  true -> setting_map
                end

                trigger_config = case config[setting.key] do
                  nil ->
                    %{
                      "email" => setting_map
                    }
                  _ ->
                    config[setting.key] |> Map.put("email", setting_map)
                end
                config = Map.put(config, setting.key, trigger_config)
                Alerts.update_alert(alert, %{ "config" => config })
              end)
          end
    end)

    webhook_sql = """
      SELECT w.key AS key, w.value AS value, w.label_id AS label_id, w.url AS url, w.notes AS notes, l.organization_id AS organization_id 
        FROM label_notification_webhooks w LEFT JOIN labels l ON l.id = w.label_id
          WHERE w.key = ANY($1)
    """
    results = Ecto.Adapters.SQL.query!(Console.Repo, webhook_sql, [events]).rows
    Enum.each(
      Enum.group_by(
        results |> Enum.map(&cast_webhook/1), &Map.take(&1, [:label_id, :organization_id])
      ), fn {x, y} ->
        {:ok, org_id} = Ecto.UUID.load(x.organization_id)
        {:ok, label_id} = Ecto.UUID.load(x.label_id)
        label = Labels.get_label(label_id)
        alert_name = case node_type do
          "device/label" -> "Alert for label #{label.name}"
          "integration" -> "Alert for label #{label.name}"
        end
        alert = Alerts.get_alert_by_name(org_id, alert_name)

        case alert do
          nil ->
            Ecto.Multi.new()
            |> Ecto.Multi.run(:alert, fn _repo, _ ->
              Alerts.create_alert(%{
                "name" => "Alert for label #{label.name}", # TODO figure out naming
                "organization_id" => org_id,
                "node_type" => node_type,
                "config" => Enum.into(Enum.map(y, fn setting ->
                  setting_map = %{
                    "url" => setting.url,
                    "notes" => setting.notes
                  }

                  setting_map = cond do
                    Map.has_key?(setting, :value) -> Map.put(setting_map, "value", setting.value)
                    true -> setting_map
                  end

                  {
                    "#{setting.key}",
                    %{"webhook" => setting_map}
                  }
                end), %{})
              })
            end)
            |> Ecto.Multi.run(:alert_node, fn _repo, %{ alert: alert } ->
              org = Organizations.get_organization(org_id)
              case type do
                "label" -> Alerts.add_alert_node(org, alert, label_id, "label")
                "integration" ->
                  {:ok, uuid} = Ecto.UUID.dump(label_id)
                  Ecto.Adapters.SQL.query!(Console.Repo, "SELECT channel_id FROM channels_labels WHERE label_id = $1", [uuid]).rows
                  |> Enum.each(fn i ->
                    {:ok, integration_id} = Ecto.UUID.load(List.first(i))
                    Alerts.add_alert_node(org, alert, integration_id, "integration")
                  end)
                  {:ok, nil}
              end
            end)
            |> Repo.transaction()
          _ ->
            config = alert.config

            Enum.each(y, fn setting ->
              setting_map = %{
                "url" => setting.url,
                "notes" => setting.notes
              }

              setting_map = cond do
                Map.has_key?(setting, :value) -> Map.put(setting_map, "value", setting.value)
                true -> setting_map
              end

              trigger_config = case config[setting.key] do
                  nil ->
                    %{
                      "webhook" => setting_map
                    }
                  _ ->
                    config[setting.key] |> Map.put("webhook", setting_map)
                end
                config = Map.put(config, setting.key, trigger_config)
                Alerts.update_alert(alert, %{ "config" => config })
            end)
        end
    end)
  end

  def up do
    run_migration("label", [
      "device_stops_transmitting",
      "device_join_otaa_first_time",
      "device_deleted",
      "downlink_unsuccessful"
    ])
    
    run_migration("integration", [
      "integration_receives_first_event",
      "integration_with_devices_updated",
      "integration_stops_working",
      "integration_with_devices_deleted"
    ])
  end

  def down do
    Ecto.Adapters.SQL.query!(Console.Repo, "DELETE FROM alerts")
  end
end
