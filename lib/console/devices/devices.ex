defmodule Console.Devices do
  @moduledoc """
  The Devices context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Devices.Device
  alias Console.Devices.DevicesChannels
  alias Console.Channels.Channel

  @doc """
  Returns the list of devices.

  ## Examples

      iex> list_devices()
      [%Device{}, ...]

  """
  def list_devices do
    Repo.all(Device)
  end

  @doc """
  Gets a single device.

  Raises `Ecto.NoResultsError` if the Device does not exist.

  ## Examples

      iex> get_device!(123)
      %Device{}

      iex> get_device!(456)
      ** (Ecto.NoResultsError)

  """
  def get_device!(id), do: Repo.get!(Device, id)
  def get_device(id), do: Repo.get(Device, id)
  def get_by_mac(mac), do: Repo.get_by(Device, mac: mac)
  def get_by_seq_id(seq_id), do: Repo.get_by(Device, seq_id: seq_id)

  def fetch_assoc(%Device{} = device, assoc \\ [:events, :team]) do
    Repo.preload(device, assoc)
  end

  @doc """
  Creates a device.

  ## Examples

      iex> create_device(%{field: value})
      {:ok, %Device{}}

      iex> create_device(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_device(attrs \\ %{}) do
    query = from(d in Device, select: d.seq_id)
    seq_id =
      case Repo.all(query) do
        [] -> 0
        list -> Enum.max(list) + 1
      end

    key = :crypto.strong_rand_bytes(16)
      |> :binary.bin_to_list()
      |> Enum.map(fn b -> :io_lib.format("0x~.16B", [b]) |> to_string() end)
      |> Enum.join(", ")

    attrs = attrs
      |> Map.put_new("seq_id", seq_id)
      |> Map.put_new("key", key)

    %Device{}
    |> Device.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a device.

  ## Examples

      iex> update_device(device, %{field: new_value})
      {:ok, %Device{}}

      iex> update_device(device, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_device(%Device{} = device, attrs) do
    device
    |> Device.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Device.

  ## Examples

      iex> delete_device(device)
      {:ok, %Device{}}

      iex> delete_device(device)
      {:error, %Ecto.Changeset{}}

  """
  def delete_device(%Device{} = device) do
    Repo.delete(device)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking device changes.

  ## Examples

      iex> change_device(device)
      %Ecto.Changeset{source: %Device{}}

  """
  def change_device(%Device{} = device) do
    Device.changeset(device, %{})
  end

  def set_device_channel(%Device{} = device, %Channel{} = channel) do
    %DevicesChannels{}
      |> DevicesChannels.join_changeset(device, channel)
      |> Repo.insert()
  end
end
