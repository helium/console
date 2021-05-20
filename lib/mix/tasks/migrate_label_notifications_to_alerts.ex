defmodule Mix.Tasks.MigrateLabelNotificationsToAlerts do
  use Mix.Task
  alias Console.Alerts
  alias Console.Repo
  alias Console.Organizations

  def cast(record) do
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

  def run(_) do
    Mix.Task.run("app.start")
    results = Ecto.Adapters.SQL.query!(
      Console.Repo, "SELECT s.key AS key, s.value AS value, s.label_id AS label_id, s.recipients AS recipients, l.organization_id AS organization_id FROM label_notification_settings s LEFT JOIN labels l ON l.id = s.label_id"
    ).rows
    Enum.each(
      Enum.group_by(
        results |> Enum.map(&cast/1), &Map.take(&1, [:label_id, :organization_id])), fn {x, y} ->
          {:ok, org_id} = Ecto.UUID.load(x.organization_id)
          {:ok, label_id} = Ecto.UUID.load(x.label_id)
          Ecto.Multi.new()
          |> Ecto.Multi.run(:alert, fn _repo, _ ->
            Alerts.create_alert(%{
              "name" => "Label Alert",
              "organization_id" => org_id,
              "node_type" => "device/label",
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
        end)
  end
end