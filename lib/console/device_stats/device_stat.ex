defmodule Console.DeviceStats.DeviceStat do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Devices.Device
  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "device_stats" do
    field :router_uuid, :string
    field :payload_size, :integer
    field :dc_used, :integer
    field :reported_at_epoch, :integer

    belongs_to :device, Device
    belongs_to :organization, Organization
    timestamps()
  end

  @doc false
  def changeset(device_stat, attrs) do
    device_stat
    |> cast(attrs, [
      :router_uuid,
      :payload_size,
      :dc_used,
      :reported_at_epoch,
      :device_id,
      :organization_id
    ])
  end
end
