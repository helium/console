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
  alias Console.Functions.Function
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "labels" do
    field :name, :string
    field :color, :string
    field :creator, :string
    field :multi_buy, :integer
    field :adr_enabled, :boolean

    belongs_to :organization, Organization
    belongs_to :function, Function
    many_to_many :devices, Device, join_through: DevicesLabels, on_delete: :delete_all
    many_to_many :channels, Channel, join_through: ChannelsLabels, on_delete: :delete_all
    has_many :label_notification_settings, LabelNotificationSetting, on_delete: :delete_all
    has_many :label_notification_events, LabelNotificationEvent, on_delete: :delete_all
    timestamps()
  end

  def changeset(label, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name", "color", "creator"])

    changeset =
      label
      |> cast(attrs, [:name, :organization_id, :color, :creator, :function_id, :multi_buy, :adr_enabled])
      |> validate_required([:name, :organization_id])
      |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
      |> unique_constraint(:name, name: :labels_name_organization_id_index, message: "This label name has already been used in this organization")
  end
end
