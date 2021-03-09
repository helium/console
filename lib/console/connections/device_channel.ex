defmodule Console.Connections.DeviceChannel do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices_channels" do
    belongs_to :device, Console.Devices.Device
    belongs_to :channel, Console.Channels.Channel
    belongs_to :organization, Console.Organizations.Organization

    timestamps()
  end

  @doc false
  def changeset(device_channel, attrs) do
    device_channel
    |> cast(attrs, [:device_id, :channel_id, :organization_id])
    |> validate_required([:device_id, :channel_id, :organization_id])
    |> unique_constraint(:device_id, name: :devices_channels_device_id_channel_id_index, message: "Device already connected to Channel")
  end
end
