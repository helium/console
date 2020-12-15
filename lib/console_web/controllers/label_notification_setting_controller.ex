defmodule ConsoleWeb.LabelNotificationsSettingController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Labels.LabelNotificationSetting
  alias Console.LabelNotificationSettings

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def update(conn, %{"label_id" => label_id, "label_notification_settings" => settings}) do
    result = 
      for setting <- settings do
        LabelNotificationSettings.get_label_notification_setting_by_key(Map.get(setting, "key"), label_id)
        |> LabelNotificationSettings.upsert_label_notification_setting(setting)
      end

    IO.inspect result

    # with {:ok, %Label{} = label} <- Labels.create_label(current_organization, label_params) do

    # broadcast?
    conn
    |> put_resp_header("message", "The label notification settings were successfully updated")
    |> render("show.json", label_notification_settings: settings)
  end

  # subscription broadcast?
end