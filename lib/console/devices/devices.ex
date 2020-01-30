defmodule Console.Devices do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Devices.Device
  alias Console.Devices.DevicesChannels
  alias Console.Channels.Channel

  def list_devices do
    Repo.all(Device)
  end

  def get_device!(id), do: Repo.get!(Device, id)

  def get_device(id), do: Repo.get(Device, id)

  def get_by_mac(mac), do: Repo.get_by(Device, mac: mac)

  def get_by_seq_id(seq_id, oui) do
     Repo.get_by(Device, [seq_id: seq_id, oui: oui])
  end

  def fetch_assoc(%Device{} = device, assoc \\ [:events, :organization, :channels]) do
    Repo.preload(device, assoc)
  end

  def create_device(attrs \\ %{}) do
    query = from(d in Device, select: d.seq_id)
    seq_id =
      case Repo.all(query) do
        [] -> 0
        list -> Enum.max(list) + 1
      end

    key = :crypto.strong_rand_bytes(16)
      |> :base64.encode

    attrs = attrs
      |> Map.put_new("seq_id", seq_id)
      |> Map.put_new("key", key)

    %Device{}
    |> Device.changeset(attrs)
    |> Repo.insert()
  end

  def update_device(%Device{} = device, attrs) do
    device
    |> Device.changeset(attrs)
    |> Repo.update()
  end

  def delete_device(%Device{} = device) do
    Repo.delete(device)
  end

  def set_device_channel(%Device{} = device, %Channel{} = channel) do
    %DevicesChannels{}
      |> DevicesChannels.join_changeset(device, channel)
      |> Repo.insert()
  end

  def delete_device_channel(%Device{} = device, channel_id) do
    Repo.get_by(DevicesChannels, [device_id: device.id, channel_id: channel_id])
    |> Repo.delete()
  end
end
