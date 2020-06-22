defmodule Console.Devices do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Devices.Device
  alias Console.Devices.DeviceImports
  alias Console.Organizations.Organization
  alias Console.Events.Event
  alias Console.Labels.DevicesLabels
  alias Console.Channels.Channel

  def list_devices do
    Repo.all(Device)
  end

  def get_organization_device_count(organization) do
    devices = from(d in Device, where: d.organization_id == ^organization.id) |> Repo.all()
    length(devices)
  end

  def get_device!(id), do: Repo.get!(Device, id)

  def get_device!(organization, id) do
     Repo.get_by!(Device, [id: id, organization_id: organization.id])
  end

  def get_devices(organization, ids) do
     from(d in Device, where: d.id in ^ids and d.organization_id == ^organization.id)
     |> Repo.all()
  end

  def get_device(organization, id) do
     Repo.get_by(Device, [id: id, organization_id: organization.id])
  end

  def get_device(id), do: Repo.get(Device, id)

  def get_by_dev_eui_app_eui(dev_eui, app_eui) do
     from(d in Device, where: d.dev_eui == ^dev_eui and d.app_eui == ^app_eui)
     |> preload([:labels])
     |> Repo.all()
  end

  def get_by_device_attrs(dev_eui, app_eui, app_key, org_id) do
     from(d in Device, where: d.dev_eui == ^dev_eui and d.app_eui == ^app_eui and d.app_key == ^app_key and d.organization_id == ^org_id)
     |> Repo.all()
  end

  def fetch_assoc(%Device{} = device, assoc \\ [:events, :organization, :channels]) do
    Repo.preload(device, assoc)
  end

  def create_device(attrs \\ %{}, %Organization{} = organization) do
    count = get_organization_device_count(organization)
    cond do
      count > 9999 ->
        {:error, :forbidden, "Device limit for organization reached"}
      true ->
        %Device{}
        |> Device.create_changeset(attrs)
        |> Repo.insert()
    end
  end

  def update_device(%Device{} = device, attrs) do
    device
    |> Device.update_changeset(attrs)
    |> Repo.update()
  end

  def update_device(%Device{} = device, attrs, "router") do
    device
    |> Device.router_update_changeset(attrs)
    |> Repo.update()
  end

  def delete_devices(device_ids, organization_id) do
    device_ids = from(d in Device, where: d.organization_id == ^organization_id and d.id in ^device_ids) |> Repo.all() |> Enum.map(fn d -> d.id end)

    Repo.transaction(fn ->
      from(dl in DevicesLabels, where: dl.device_id in ^device_ids) |> Repo.delete_all()
      from(e in Event, where: e.device_id in ^device_ids) |> Repo.delete_all()
      from(d in Device, where: d.id in ^device_ids) |> Repo.delete_all()
    end)
  end

  def delete_device(%Device{} = device) do
    Repo.delete(device)
  end

  def get_current_imports(%Organization{} = organization) do
    query = from di in DeviceImports,
      where: di.organization_id == ^organization.id
      and di.status == ^"importing"
    query
      |> Repo.all()
  end

  def create_import(%Organization{} = organization, user_id, type) do
    %DeviceImports{
      organization_id: organization.id,
      user_id: user_id,
      successful_devices: 0,
      status: "importing",
      type: type
    }
    |> Repo.insert()
  end

  def update_import(device_import, update_attrs) do
    device_import
    |> DeviceImports.update_changeset(update_attrs)
    |> Repo.update()
  end
end
