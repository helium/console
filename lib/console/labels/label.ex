defmodule Console.Labels.Label do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Devices.Device
  alias Console.Labels.DevicesLabels
  alias Console.Channels.Channel
  alias Console.Labels.ChannelsLabels
  alias Console.Labels.LabelNotificationEvent
  alias Console.Labels.LabelNotificationSetting
  alias Console.Labels.LabelNotificationWebhook
  alias Console.Functions.Function
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "labels" do
    field :name, :string
    field :color, :string
    field :creator, :string
    field :multi_buy, :integer
    field :adr_allowed, :boolean

    belongs_to :organization, Organization
    many_to_many :devices, Device, join_through: DevicesLabels, on_delete: :delete_all
    has_many :label_notification_settings, LabelNotificationSetting, on_delete: :delete_all
    has_many :label_notification_events, LabelNotificationEvent, on_delete: :delete_all
    has_many :label_notification_webhooks, LabelNotificationWebhook, on_delete: :delete_all
    timestamps()
  end

  def changeset(label, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name", "color", "creator"])

    label
    |> cast(attrs, [:name, :organization_id, :color, :creator, :function_id, :multi_buy, :adr_allowed])
    |> validate_required([:name, :organization_id])
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> validate_number(:multi_buy, greater_than: 0, less_than: 11)
    |> unique_constraint(:name, name: :labels_name_organization_id_index, message: "This label name has already been used in this organization")
  end
end
