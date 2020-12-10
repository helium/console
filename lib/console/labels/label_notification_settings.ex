defmodule Console.Labels.LabelNotificationSettings do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "label_notification_settings" do
    field :key, :string
    field :value, :string
    field :recipients, :string
    belongs_to :label, Console.Labels.Label

    timestamps()
  end

  def changeset(label_notification_setting, attrs) do
    label_notification_setting
    |> cast(attrs, [:key, :value, :recipients, :label_id])
    |> validate_required([:label_id])
    |> unique_constraint(:key, name: :label_notification_settings_key_label_id_index, message: "Setting already exists for this label")
  end

  def join_changeset(label_notification_setting, key, value, recipients, label) do
    label_notification_setting
    |> changeset(%{key: key, value: value, recipients: recipients, label_id: label.id})
  end
end