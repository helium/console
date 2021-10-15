defmodule Console.Devices do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Devices.Device
  alias Console.Devices.DeviceImports
  alias Console.Organizations.Organization
  alias Console.Labels.DevicesLabels
  alias Console.Organizations.Organization
  alias Console.Events.Event

  def list_devices do
    Repo.all(Device)
  end

  def list_devices_no_disco_mode do
    from(d in Device, where: is_nil(d.hotspot_address))
    |> Repo.all()
  end

  def get_device(id), do: Repo.get(Device, id)
  def get_device!(id), do: Repo.get!(Device, id)

  def get_device(organization, id) do
     Repo.get_by(Device, [id: id, organization_id: organization.id])
  end
  def get_device!(organization, id) do
     Repo.get_by!(Device, [id: id, organization_id: organization.id])
  end

  def get_devices(organization, ids) do
     from(d in Device, where: d.id in ^ids and d.organization_id == ^organization.id)
     |> Repo.all()
  end

  def get_devices(organization_id) do
     from(d in Device, where: d.organization_id == ^organization_id)
     |> Repo.all()
  end

  def get_devices_in_list(ids) do
     from(d in Device, where: d.id in ^ids)
     |> Repo.all()
  end

  def get_by_dev_eui_app_eui(dev_eui, app_eui) do
     from(d in Device, where: d.dev_eui == ^dev_eui and d.app_eui == ^app_eui)
     |> Repo.all()
  end

  def get_by_dev_eui(dev_eui) do
     from(d in Device, where: d.dev_eui == ^dev_eui)
     |> Repo.all()
  end

  def get_by_device_attrs(dev_eui, app_eui, app_key, org_id) do
     from(d in Device, where: d.dev_eui == ^dev_eui and d.app_eui == ^app_eui and d.app_key == ^app_key and d.organization_id == ^org_id)
     |> Repo.all()
  end

  def get_devices_for_label(label_id) do
    query = from d in Device,
      join: dl in DevicesLabels, on: dl.device_id == d.id,
      where: dl.label_id == ^label_id
    Repo.all(query)
  end

  def get_devices_for_labels(label_ids) do
    query = from d in Device,
      join: dl in DevicesLabels, on: dl.device_id == d.id,
      where: dl.label_id in ^label_ids
    Repo.all(query)
  end

  def get_device_for_hotspot_address(address) do
    Device
      |> where([d], d.hotspot_address == ^address)
      |> Repo.one()
  end

  def fetch_assoc(%Device{} = device, assoc \\ [:events, :organization]) do
    Repo.preload(device, assoc)
  end

  def create_device(attrs \\ %{}, %Organization{} = organization) do
    count = get_organization_device_count(organization)
    cond do
      organization.name !== "Discovery Mode (Helium)" and count > 9999 ->
        {:error, :forbidden, "Device limit for organization reached"}
      true ->
        cond do
          attrs["hotspot_address"] != nil ->
            %Device{}
            |> Device.create_discovery_changeset(attrs)
            |> Repo.insert()
          true ->
            %Device{}
            |> Device.create_changeset(attrs)
            |> Repo.insert()
        end
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

    Ecto.Multi.new()
      |> Ecto.Multi.run(:devices_labels, fn _repo, _ ->
        with {count, nil} <- from(dl in DevicesLabels, where: dl.device_id in ^device_ids) |> Repo.delete_all() do
          {:ok, count}
        end
      end)
      |> Ecto.Multi.run(:devices, fn _repo, _ ->
        with {count, nil} <- from(d in Device, where: d.id in ^device_ids) |> Repo.delete_all() do
          {:ok, count}
        end
      end)
     |> Repo.transaction()
  end

  def delete_all_devices_for_org(organization_id) do
    devices = get_devices(organization_id)
    Enum.map(devices, fn d -> d.id end)
    |> delete_devices(organization_id)
    List.first(devices)
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
    %DeviceImports{}
    |> DeviceImports.create_changeset(%{
      organization_id: organization.id,
      user_id: user_id,
      successful_devices: 0,
      status: "importing",
      type: type
    })
    |> Repo.insert()
  end

  def update_import(device_import, update_attrs) do
    device_import
    |> DeviceImports.update_changeset(update_attrs)
    |> Repo.update()
  end

  def update_devices_active(device_ids, active, organization) do
    from(d in Device, where: d.id in ^device_ids and d.organization_id == ^organization.id)
    |> Repo.update_all(set: [active: active])
  end

  def get_events(device_id) do
    from(e in Event, where: e.device_id == ^device_id, order_by: [desc: :reported_at_naive])
    |> limit(1440)
    |> Repo.all()
  end

  defp get_organization_device_count(organization) do
    devices = from(d in Device, where: d.organization_id == ^organization.id) |> Repo.all()
    length(devices)
  end

  def update_in_xor_filter(device_ids) do
    with {count, nil} <- from(d in Device, where: d.id in ^device_ids) |> Repo.update_all(set: [in_xor_filter: true]) do
      if count > 0 do
        devices = from(d in Device, where: d.id in ^device_ids) |> Repo.all()
        {:ok, devices}
      else
        {:error, "No devices were updated"}
      end
    end
  end

  def update_config_profile_for_devices(device_ids, config_profile_id, organization_id) do
    from(d in Device, where: d.id in ^device_ids and d.organization_id == ^organization_id)
    |> Repo.update_all(set: [config_profile_id: config_profile_id])
  end
end
