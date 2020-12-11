defmodule ConsoleWeb.LabelNotificationSettingController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Labels.LabelNotificationSetting

  def update(conn, %{"label_id" => label_id, "label_notification_settings" => settings}) do
    result = 
      for setting <- settings do
        LabelNotificationSetting.get_label_notification_setting_by_key(setting.key, label_id)
        |> LabelNotificationSetting.upsert_label_notification_setting(setting)
      end

    IO.inspect result

    # broadcast?
    conn
    |> put_resp_header("message", "The label notification settings were successfully updated")
    |> render("show.json", label_notification_settings: settings)
  end

  # subscription broadcast?
end