defmodule Console.Labels.LabelNotificationWebhook do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "label_notification_webhooks" do
    field :key, :string
    field :url, :string
    field :notes, :string
    field :value, :string
    belongs_to :label, Console.Labels.Label

    timestamps()
  end

  def changeset(label_notification_webhook, attrs) do
    label_notification_webhook
    |> cast(attrs, [:key, :url, :notes, :label_id, :value])
    |> validate_required(:url, message: "Webhook URL is required")
    |> validate_required([:key, :label_id, :value])
    |> unique_constraint(:key, name: :label_notification_webhooks_key_label_id_index, message: "Webhook already exists for this label and key")
  end
end 