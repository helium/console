defmodule Console.LabelNotificationSettings do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.LabelNotificationSetting
  
  def get_label_notification_setting!(id), do: Repo.get!(LabelNotificationSetting, id)
  def get_label_notification_setting(id), do: Repo.get(LabelNotificationSetting, id)

  def get_label_notification_setting_by_label_and_key(label_id, key) do
    Repo.get_by(LabelNotificationSetting, [label_id: label_id, key: key])
  end

  def get_label_notification_settings_by_key(key) do
    from(s in LabelNotificationSetting, where: s.key == ^key)
     |> Repo.all()
  end

  def upsert_label_notification_setting(attrs \\ %{}) do
    %LabelNotificationSetting{}
    |> LabelNotificationSetting.changeset(attrs)
    |> Repo.insert!(conflict_target: [:key, :label_id], on_conflict: {:replace, [:value, :recipients]})
  end

  def delete_label_notification_setting_by_key_and_label(label_notification_setting_key, label_id) do
    with {count, nil} <- from(ns in LabelNotificationSetting, where: ns.key == ^label_notification_setting_key and ns.label_id == ^label_id) |> Repo.delete_all() do
      {:ok, count}
    end
  end
end