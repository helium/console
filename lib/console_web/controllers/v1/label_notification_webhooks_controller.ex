defmodule ConsoleWeb.V1.LabelNotificationWebhooksController do
  use ConsoleWeb, :controller

  alias Console.LabelNotificationWebhooks
  alias Console.Labels
  alias Console.Labels.Label
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def update(conn, _webhook_params = %{ "key" => key, "url" => url, "value" => value, "id" => label_id, "notes" => notes }) do
    update(conn, key, url, value, label_id, notes)
  end

  def update(conn, _webhook_params = %{ "key" => key, "url" => url, "value" => value, "id" => label_id }) do
    update(conn, key, url, value, label_id, nil)
  end

  defp update(conn, key, url, value, label_id, notes) do
    case Labels.get_label!(label_id) do
      nil ->
        {:error, :not_found, "Label not found"}
      %Label{} = _label ->
        key_ok = key in ["device_deleted", "device_join_otaa_first_time", "device_stops_transmitting", "integration_stops_working", "integration_receives_first_event", "downlink_unsuccessful", "integration_with_devices_deleted", "integration_with_devices_updated"]
        case key_ok do
          false -> {:error, :forbidden, "Key must be: \"device_deleted\", \"device_join_otaa_first_time\", \"device_stops_transmitting\", \"integration_stops_working\", \"integration_receives_first_event\", \"downlink_unsuccessful\", \"integration_with_devices_deleted\", or \"integration_with_devices_updated\""}
          true -> 
            webhook_params = %{ "key" => key, "url" => url, "value" => value, "label_id" => label_id, "notes" => notes }
            case value do
              "0" -> LabelNotificationWebhooks.delete(key, label_id)
              _ -> LabelNotificationWebhooks.upsert_webhook(webhook_params)
            end
            conn
            |> put_status(:accepted)
            |> render("label_notification_webhooks.json", label_notification_webhooks: webhook_params)
        end
    end
  end
end