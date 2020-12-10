defmodule Console.Labels.LabelNotificationQueue do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "label_notification_queue" do
    field :reported_at, :string
    field :key, :string
    field :details, Console.Json.Type
    field :sent, :boolean
    belongs_to :label, Console.Labels.Label

    timestamps()
  end

  def changeset(label_notification_queue, attrs) do
    label_notification_queue
    |> cast(attrs, [:key, :details, :sent, :label_id])
    |> validate_required([:label_id])
  end

  def join_changeset(label_notification_queue, key, details, sent, label) do
    label_notification_queue
    |> changeset(%{key: key, details: details, sent: sent, label_id: label.id})
  end
end