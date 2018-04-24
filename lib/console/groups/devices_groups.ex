defmodule Console.Groups.DevicesGroups do
  use Ecto.Schema

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices_groups" do
    belongs_to :device, Console.Devices.Device
    belongs_to :group, Console.Groups.Group

    timestamps()
  end
end
