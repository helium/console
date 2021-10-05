defmodule Console.Devices.Device do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Events.Event
  alias Console.Labels.DevicesLabels
  alias Console.Labels.Label
  alias Console.MultiBuys.MultiBuy
  alias Console.ConfigProfiles.ConfigProfile
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices" do
    field :name, :string
    field :dev_eui, :string
    field :app_key, :string
    field :app_eui, :string
    field :oui, :integer
    field :frame_up, :integer
    field :frame_down, :integer
    field :total_packets, :integer
    field :last_connected, :naive_datetime
    field :dc_usage, :integer
    field :active, :boolean
    field :hotspot_address, :string
    field :adr_allowed, :boolean
    field :cf_list_enabled, :boolean
    field :in_xor_filter, :boolean

    belongs_to :organization, Organization
    belongs_to :multi_buy, MultiBuy
    belongs_to :config_profile, ConfigProfile
    has_many :events, Event, on_delete: :delete_all
    many_to_many :labels, Label, join_through: DevicesLabels, on_delete: :delete_all

    timestamps()
  end

  def create_changeset(device, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name", "dev_eui", "app_eui", "app_key"])
    attrs = Helpers.upcase_attrs(attrs, ["dev_eui", "app_eui", "app_key"])

    device
      |> cast(attrs, [:name, :dev_eui, :app_eui, :app_key, :organization_id, :config_profile_id])
      |> put_change(:oui, Application.fetch_env!(:console, :oui))
      |> check_attrs_format()
      |> validate_required([:name, :dev_eui, :app_eui, :app_key, :oui, :organization_id])
      |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
      |> unique_constraint(:dev_eui, name: :devices_dev_eui_app_eui_app_key_index, message: "Please choose device credentials with unique DevEUI, AppEUI, and AppKey")
      |> unique_constraint(:hotspot_address, name: :devices_hotspot_address_index, message: "This hotspot address is already used")
  end

  def create_discovery_changeset(device, device_params = %{ "name" => _name, "hotspot_address" => _hotspot_address, "organization_id" => _organization_id }) do
    alphabet = '0123456789ABCDEF'
    device_params =
      Map.merge(device_params, %{
        "dev_eui" => Helpers.generate_string(16, alphabet),
        "app_eui" => Helpers.generate_string(16, alphabet),
        "app_key" => Helpers.generate_string(32, alphabet),
      })

    device
      |> cast(device_params, [:name, :dev_eui, :app_eui, :app_key, :hotspot_address, :organization_id])
      |> put_change(:oui, Application.fetch_env!(:console, :oui))
      |> check_attrs_format()
      |> validate_required([:name, :dev_eui, :app_eui, :app_key, :oui, :organization_id])
      |> unique_constraint(:dev_eui, name: :devices_dev_eui_app_eui_app_key_index, message: "Values for DevEUI, AppEUI, and AppKey must be unique, please try again")
      |> unique_constraint(:hotspot_address, name: :devices_hotspot_address_index, message: "This hotspot address is already used")
  end

  def update_changeset(device, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name", "dev_eui", "app_eui", "app_key"])
    attrs = Helpers.upcase_attrs(attrs, ["dev_eui", "app_eui", "app_key"])

    device
      |> cast(attrs, [:name, :dev_eui, :app_eui, :app_key, :active, :adr_allowed, :multi_buy_id, :cf_list_enabled, :config_profile_id])
      |> check_attrs_format()
      |> validate_required([:name, :dev_eui, :app_eui, :app_key, :oui, :organization_id])
      |> validate_length(:name, max: 50)
      |> unique_constraint(:dev_eui, name: :devices_dev_eui_app_eui_app_key_index, message: "Please choose device credentials with unique DevEUI, AppEUI, and AppKey")
      |> unique_constraint(:hotspot_address, name: :devices_hotspot_address_index, message: "This hotspot address is already used")
  end

  def router_update_changeset(device, attrs) do
    device
      |> cast(attrs, [:frame_up, :frame_down, :last_connected, :total_packets, :dc_usage, :in_xor_filter])
  end

  defp check_attrs_format(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: changes} ->
        dev_eui_valid = Map.get(changes, :dev_eui) == nil or String.match?(changes.dev_eui, ~r/[0-9a-fA-F]{16}/)
        app_eui_valid = Map.get(changes, :app_eui) == nil or String.match?(changes.app_eui, ~r/[0-9a-fA-F]{16}/)
        app_key_valid = Map.get(changes, :app_key) == nil or String.match?(changes.app_key, ~r/[0-9a-fA-F]{32}/)

        cond do
          !dev_eui_valid -> add_error(changeset, :message, "Dev EUI must be exactly 8 bytes long, and only contain characters 0-9 A-F")
          !app_eui_valid -> add_error(changeset, :message, "App EUI must be exactly 8 bytes long, and only contain characters 0-9 A-F")
          !app_key_valid -> add_error(changeset, :message, "App Key must be exactly 16 bytes long, and only contain characters 0-9 A-F")
          true -> changeset
        end
      _ ->
        changeset
    end
  end
end
