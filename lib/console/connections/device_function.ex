defmodule Console.Connections.DeviceFunction do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices_functions" do
    belongs_to :device, Console.Devices.Device
    belongs_to :function, Console.Functions.Function
    belongs_to :organization, Console.Organizations.Organization

    timestamps()
  end

  @doc false
  def changeset(device_function, attrs) do
    device_function
    |> cast(attrs, [:device_id, :function_id, :organization_id])
    |> validate_required([:device_id, :function_id, :organization_id])
    |> unique_constraint(:device_id, name: :devices_functions_device_id_function_id_index, message: "Device already connected to Function")
  end
end
