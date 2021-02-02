defmodule ConsoleWeb.V1.LabelNotificationSettingsController do
  use ConsoleWeb, :controller
  alias Console.Repo
  import Ecto.Query

  alias Console.LabelNotificationSettings
  alias Console.Labels
  alias Console.Labels.Label
  action_fallback(ConsoleWeb.FallbackController)

  plug CORSPlug, origin: "*"

  def update(conn, settings_params = %{ "key" => key, "recipients" => recipients, "value" => value, "label_id" => label_id }) do
    case Labels.get_label!(label_id) do
      nil ->
        {:error, :not_found, "Label not found"}
      %Label{} = label ->
        recipients_ok = recipients in ["admin", "manager", "read", "all"]
        key_ok = key in ["device_deleted", "device_join_otaa_first_time", "device_stops_transmitting", "integration_stops_working", "integration_receives_first_event", "downlink_unsuccessful", "integration_with_devices_deleted", "integration_with_devices_updated"]
        case recipients_ok and key_ok do
          false -> cond do 
            key_ok and not recipients_ok -> 
              {:error, :bad_request, "Recipients must be: \"admin\", \"manager\", \"read\", or \"all\""}
            recipients_ok and not key_ok ->
              {:error, :bad_request, "Key must be: \"device_deleted\", \"device_join_otaa_first_time\", \"device_stops_transmitting\", \"integration_stops_working\", \"integration_receives_first_event\", \"downlink_unsuccessful\", \"integration_with_devices_deleted\", or \"integration_with_devices_updated\""}
            not recipients_ok and not key_ok ->
              {:error, :bad_request, "Recipients must be: \"admin\", \"manager\", \"read\", or \"all\" & key must be: \"device_deleted\", \"device_join_otaa_first_time\", \"device_stops_transmitting\", \"integration_stops_working\", \"integration_receives_first_event\", \"downlink_unsuccessful\", \"integration_with_devices_deleted\", or \"integration_with_devices_updated\""}
          end
          true -> 
            case value do
              "0" -> LabelNotificationSettings.delete_label_notification_setting_by_key_and_label(key, label_id)
              _ -> LabelNotificationSettings.upsert_label_notification_setting(settings_params)
            end
            conn
            |> put_status(:accepted)
            |> render("label_notification_settings.json", label_notification_settings: settings_params)
        end
    end
  end
end