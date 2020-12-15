defmodule ConsoleWeb.LabelNotificationSettingsController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.Labels.LabelNotificationSetting
  alias Console.LabelNotificationSettings

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def update(conn, %{"label_notification_settings" => settings}) do
    with {:ok, :ok} <- Repo.transaction(fn ->
      Enum.each(settings, fn setting -> 
        LabelNotificationSettings.upsert_label_notification_setting(setting)
      end)
    end)
    do
      conn
      |> put_resp_header("message", "The label notification settings were successfully updated")
      |> render("show.json", label_notification_settings: settings)
    end
  end

  def show(conn, %{ "label_id" => label_id }) do
    case LabelNotificationSettings.get_label_notification_settings_for_label(label_id) do
      nil ->
        {:error, :not_found, "Label notification settings not found"}
      [%LabelNotificationSetting{}] = label_notification_settings ->
        render(conn, "show.json", label_notification_settings: label_notification_settings)
    end
  end

end