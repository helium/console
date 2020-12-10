defmodule Console.Labels.LabelNotificationEvents do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "label_notification_events" do
    field :reported_at, :string
    field :key, :string
    field :details, :map
    field :sent, :boolean
    belongs_to :label, Console.Labels.Label

    timestamps()
  end

  def changeset(label_notification_event, attrs) do
    label_notification_event
    |> cast(attrs, [:key, :details, :sent, :label_id])
    |> validate_required([:key, :details, :sent, :label_id])
  end

  def join_changeset(label_notification_event, key, details, sent, label) do
    label_notification_event
    |> changeset(%{key: key, details: details, sent: sent, label_id: label.id})
  end
end