defmodule Console.Devices.DeviceImports do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization

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
  end

end
