defmodule Console.Devices.DevicesChannels do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices_channels" do
    belongs_to :channel, Console.Channels.Channel
    belongs_to :device, Console.Devices.Device

    timestamps()
  end

  @doc false
  def changeset(devices_channel, attrs) do
    devices_channel
    |> cast(attrs, [:device_id, :channel_id])
    |> validate_required([:device_id, :channel_id])
    |> unique_constraint(:device_id, name: :device_channel_unique_index, message: "Device already set to channel")
  end

  def join_changeset(devices_channel, device, channel) do
    devices_channel
    |> changeset(%{device_id: device.id, channel_id: channel.id})
  end
end
