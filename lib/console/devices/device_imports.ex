defmodule Console.Devices.DeviceImports do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Devices.Device

  @primary_key{:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "device_imports" do
    field :user_id, :string
    field :type, :string
    field :status, :string # One of importing, failed, successful
    field :successful_devices, :integer

    belongs_to :organization, Organization

    timestamps()
  end

  def update_changeset(device_import, attrs) do
    device_import
    |> cast(attrs, [:status, :successful_devices, :updated_at])
    |> Device.check_attrs_format()
  end

  def create_changeset(device_import, attrs) do
    device_import
    |> cast(attrs, [:user_id, :type, :status, :successful_devices, :organization_id])
    |> Device.check_attrs_format()
    |> validate_required([:user_id, :organization_id, :type, :status])
  end

end
