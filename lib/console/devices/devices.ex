defmodule Console.Devices do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Devices.Device
  alias Console.Labels.DevicesLabels
  alias Console.Channels.Channel

  def list_devices do
    Repo.all(Device)
  end

  def get_device!(id), do: Repo.get!(Device, id)

  def get_device(id), do: Repo.get(Device, id)

  def get_by_dev_eui_app_eui(dev_eui, app_eui) do
     from(d in Device, where: d.dev_eui == ^dev_eui and d.app_eui == ^app_eui)
     |> Repo.all()
  end

  def fetch_assoc(%Device{} = device, assoc \\ [:events, :organization, :channels]) do
    Repo.preload(device, assoc)
  end

  def create_device(attrs \\ %{}) do
    %Device{}
    |> Device.changeset(attrs)
    |> Repo.insert()
  end

  def update_device(%Device{} = device, attrs) do
    device
    |> Device.changeset(attrs)
    |> Repo.update()
  end

  def delete_devices(device_ids) do
    Repo.transaction(fn ->
      from(dl in DevicesLabels, where: dl.device_id in ^device_ids) |> Repo.delete_all()
      from(d in Device, where: d.id in ^device_ids) |> Repo.delete_all()
    end)
  end

  def delete_device(%Device{} = device) do
    Repo.delete(device)
  end
end
