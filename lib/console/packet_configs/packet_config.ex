defmodule Console.PacketConfigs.PacketConfig do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias Console.Devices.Device
  alias Console.Labels.Label
  alias Console.Organizations.Organization
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "packet_configs" do
    field :name, :string
    field :multi_buy_value, :integer
    field :multi_active, :boolean
    field :preferred_active, :boolean

    belongs_to :organization, Organization
    has_many :devices, Device
    has_many :labels, Label
    timestamps()
  end

  def changeset(packet_config, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])
    IO.inspect attrs

    packet_config
    |> cast(attrs, [:name, :multi_buy_value, :multi_active, :preferred_active, :organization_id])
    |> validate_required(:name, message: "Name cannot be blank")
    |> validate_length(:name, min: 3, message: "Name must be at least 3 characters")
    |> validate_length(:name, max: 25, message: "Name cannot be longer than 25 characters")
    |> validate_number(:multi_buy_value, greater_than: 0, less_than: 22)
    |> validate_settings
    |> unique_constraint(:name, name: :packet_configs_name_organization_id_index, message: "This name has already been used in this organization")
  end

  defp validate_settings(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: changes, data: data} ->
        case changes do
          %{:multi_active => multi_active, :preferred_active => preferred_active} ->
            if multi_active and preferred_active do
              add_error(changeset, :message, "Packet Config cannot have both Multiple Packets and Preferred Hotspots settings on")
            else
              changeset
            end
          %{:multi_active => multi_active} ->
            if multi_active and data.preferred_active do
              add_error(changeset, :message, "Packet Config cannot have both Multiple Packets and Preferred Hotspots settings on")
            else
              changeset
            end
          %{:preferred_active => preferred_active} ->
            if preferred_active and data.multi_active do
              add_error(changeset, :message, "Packet Config cannot have both Multiple Packets and Preferred Hotspots settings on")
            else
              changeset
            end
          _ -> changeset
        end
      _ -> changeset
    end
  end
end
