defmodule Console.Labels.Label do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Devices.Device
  alias Console.Labels.DevicesLabels
  alias Console.PacketConfigs.PacketConfig
  alias Console.ConfigProfiles.ConfigProfile
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "labels" do
    field :name, :string
    field :creator, :string

    belongs_to :organization, Organization
    belongs_to :packet_config, PacketConfig
    belongs_to :config_profile, ConfigProfile
    many_to_many :devices, Device, join_through: DevicesLabels, on_delete: :delete_all
    timestamps()
  end

  def changeset(label, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name", "creator"])

    label
    |> cast(attrs, [:name, :organization_id, :creator, :packet_config_id, :config_profile_id])
    |> validate_required([:name, :organization_id])
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> unique_constraint(:name, name: :labels_name_organization_id_index, message: "This label name has already been used in this organization")
  end
end
