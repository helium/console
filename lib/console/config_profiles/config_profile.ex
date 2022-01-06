defmodule Console.ConfigProfiles.ConfigProfile do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias Console.Devices.Device
  alias Console.Labels.Label
  alias Console.Organizations.Organization
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "config_profiles" do
    field :name, :string
    field :adr_allowed, :boolean
    field :cf_list_enabled, :boolean
    field :rx_delay, :integer

    belongs_to :organization, Organization
    has_many :devices, Device
    has_many :labels, Label
    timestamps()
  end

  def changeset(config_profile, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    config_profile
    |> cast(attrs, [:name, :adr_allowed, :cf_list_enabled, :organization_id, :rx_delay])
    |> validate_required(:name, message: "Name cannot be blank")
    |> validate_required([:organization_id, :name, :adr_allowed, :cf_list_enabled, :rx_delay])
    |> validate_length(:name, min: 3, message: "Name must be at least 3 characters")
    |> validate_length(:name, max: 25, message: "Name cannot be longer than 25 characters")
    |> validate_number(:rx_delay, less_than_or_equal_to: 15)
    |> validate_number(:rx_delay, greater_than_or_equal_to: 1)
    |> unique_constraint(:name, name: :config_profiles_name_organization_id_index, message: "This name has already been used in this organization")
  end
end
