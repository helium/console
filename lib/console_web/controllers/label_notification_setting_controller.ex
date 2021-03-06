defmodule ConsoleWeb.LabelNotificationSettingsController do
  use ConsoleWeb, :controller

  alias Console.Repo
  alias Console.LabelNotificationSettings
  alias Console.Labels

  plug ConsoleWeb.Plug.AuthorizeAction

  action_fallback(ConsoleWeb.FallbackController)

  def update(conn, %{"label_notification_settings" => settings}) do
    with {:ok, :ok} <- Repo.transaction(fn ->
      Enum.each(settings, fn setting ->
        case setting["value"] do
          "0" -> LabelNotificationSettings.delete_label_notification_setting_by_key_and_label(setting["key"], setting["label_id"])
          _ -> LabelNotificationSettings.upsert_label_notification_setting(setting)
        end
      end)
    end)
    do
      label = Labels.get_label(List.first(settings)["label_id"])
      label = Repo.preload(label, [:label_notification_settings])
      ConsoleWeb.Endpoint.broadcast("graphql:label_show", "graphql:label_show:#{label.id}:label_update", %{})

      conn
      |> put_resp_header("message", "The label notification settings were successfully updated")
      |> render("label_notification_settings.json", label_notification_settings: settings)
    end
  end
end
