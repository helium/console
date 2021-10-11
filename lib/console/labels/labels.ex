defmodule Console.Labels do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Devices.Device
  alias Console.Devices
  alias Console.Organizations.Organization

  def get_label!(id), do: Repo.get!(Label, id)
  def get_label(id), do: Repo.get(Label, id)
  def get_label!(organization, id) do
     Repo.get_by!(Label, [id: id, organization_id: organization.id])
  end

  def get_labels(organization, ids) do
     from(l in Label, where: l.id in ^ids and l.organization_id == ^organization.id)
     |> Repo.all()
  end

  def get_labels_and_attached_devices(ids) do
    from(l in Label, where: l.id in ^ids)
    |> preload([:devices])
    |> Repo.all()
  end

  def get_labels_of_device(device) do
     from(dl in DevicesLabels, where: dl.device_id == ^device.id)
     |> Repo.all()
  end

  def get_labels_of_device_in_order_of_attachment(device) do
     from(dl in DevicesLabels, where: dl.device_id == ^device.id, order_by: [desc: dl.inserted_at])
     |> Repo.all()
  end

  def get_label(organization, id) do
     Repo.get_by(Label, [id: id, organization_id: organization.id])
  end

  def fetch_assoc(%Label{} = label, assoc \\ [:devices]) do
    Repo.preload(label, assoc)
  end

  def multi_fetch_assoc(labels, assoc \\ [:devices]) do
    Repo.preload(labels, assoc)
  end

  def get_label_by_name(name, organization_id) do
    Repo.get_by(Label, [name: name, organization_id: organization_id])
  end

  def create_label(%Organization{} = organization, attrs \\ %{}) do
    count = get_organization_label_count(organization)
    cond do
      count > 9999 ->
        {:error, :forbidden, "Label limit for organization reached"}
      true ->
        %Label{}
        |> Label.changeset(attrs)
        |> Repo.insert()
    end
  end

  def create_label!(%Organization{} = organization, attrs \\ %{}) do
    count = get_organization_label_count(organization)
    cond do
      count > 9999 ->
        {:error, :forbidden, "Label limit for organization reached"}
      true ->
        %Label{}
        |> Label.changeset(attrs)
        |> Repo.insert!()
    end
  end

  def update_label(%Label{} = label, attrs) do
    label
    |> Label.changeset(attrs)
    |> Repo.update()
  end

  def delete_label(%Label{} = label) do
    Repo.delete(label)
  end

  def delete_labels(label_ids, organization_id) do
    label_ids = from(l in Label, where: l.organization_id == ^organization_id and l.id in ^label_ids) |> Repo.all() |> Enum.map(fn l -> l.id end)

    Ecto.Multi.new()
      |> Ecto.Multi.run(:devices_labels, fn _repo, _ ->
        with {count, nil} <- from(dl in DevicesLabels, where: dl.label_id in ^label_ids) |> Repo.delete_all() do
          {:ok, count}
        end
      end)
      |> Ecto.Multi.run(:labels, fn _repo, _ ->
        with {count, nil} <- from(l in Label, where: l.id in ^label_ids) |> Repo.delete_all() do
          {:ok, count}
        end
      end)
     |> Repo.transaction()
  end

  def add_devices_to_label(devices, labels, to_label, organization) do
    labels_query = from(l in Label, preload: [:devices], where: l.id in ^labels and l.organization_id == ^organization.id, select: l)
    label_devices = Repo.all(labels_query) |> Enum.flat_map(fn %Label{ devices: devices } -> devices end)

    devices_query = from(d in Device, where: d.id in ^devices and d.organization_id == ^organization.id, select: d)
    other_devices = Repo.all(devices_query)

    all_devices = Enum.concat(label_devices, other_devices) |> Enum.uniq()

    devices_labels = Enum.reduce(all_devices, [], fn device, acc ->
      if Repo.get_by(DevicesLabels, device_id: device.id, label_id: to_label) == nil do
        acc ++ [%{ device_id: device.id, label_id: to_label }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(devices_labels, fn attrs ->
          Repo.insert!(DevicesLabels.changeset(%DevicesLabels{}, attrs))
        end)
      end)
    do
      {:ok, length(devices_labels), devices_labels}
    end
  end

  def get_device_labels(device_id) do
    from(dl in DevicesLabels, where: dl.device_id == ^device_id)
     |> Repo.all()
  end

  def add_devices_to_label(devices, to_label, organization) do
    devices_query = from(d in Device, where: d.id in ^devices and d.organization_id == ^organization.id, select: d)
    all_devices = Repo.all(devices_query)

    devices_labels = Enum.reduce(all_devices, [], fn device, acc ->
      if Repo.get_by(DevicesLabels, device_id: device.id, label_id: to_label) == nil do
        acc ++ [%{ device_id: device.id, label_id: to_label }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(devices_labels, fn attrs ->
          Repo.insert!(DevicesLabels.changeset(%DevicesLabels{}, attrs))
        end)
      end)
    do
      {:ok, length(devices_labels), devices_labels}
    end
  end

  def delete_devices_from_label(devices, label_id, organization) do
    case get_label(organization, label_id) do
      nil -> { :error }
      _ ->
        query = from(dl in DevicesLabels, where: dl.device_id in ^devices and dl.label_id == ^label_id)
        Repo.delete_all(query)
    end
  end

  def delete_labels_from_device(labels, device_id, organization) do
    case Devices.get_device(organization, device_id) do
      nil -> { :error }
      _ ->
        query = from(dl in DevicesLabels, where: dl.label_id in ^labels and dl.device_id == ^device_id)
        Repo.delete_all(query)
    end
  end

  def delete_all_labels_from_devices(device_ids, organization) do
    devices = Devices.get_devices(organization, device_ids)
    case devices do
      [] -> { :error }
      _ ->
        ids = Enum.map(devices, fn d -> d.id end)
        query = from(dl in DevicesLabels, where: dl.device_id in ^ids)
        Repo.delete_all(query)
        { :ok, devices }
    end
  end

  def delete_all_labels_from_devices_for_org(organization) do
    devices = Devices.get_devices(organization.id)

    ids = Enum.map(devices, fn device -> device.id end)

    from(dl in DevicesLabels, where: dl.device_id in ^ids)
    |> Repo.delete_all()

    List.first(devices)
  end

  def delete_all_devices_from_labels(label_ids, organization) do
    labels = get_labels(organization, label_ids)
    case labels do
      [] -> { :error }
      _ ->
        ids = Enum.map(labels, fn l -> l.id end)
        query = from(dl in DevicesLabels, where: dl.label_id in ^ids)
        Repo.delete_all(query)
        { :ok, labels }
    end
  end

  def add_labels_to_device(labels, device, organization) do
    labels_query = from(l in Label, where: l.id in ^labels and l.organization_id == ^organization.id, select: l)
    all_labels = Repo.all(labels_query)

    devices_labels = Enum.reduce(all_labels, [], fn label, acc ->
      if Repo.get_by(DevicesLabels, device_id: device.id, label_id: label.id) == nil do
        acc ++ [%{ device_id: device.id, label_id: label.id }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(devices_labels, fn attrs ->
          Repo.insert!(DevicesLabels.changeset(%DevicesLabels{}, attrs))
        end)
      end)
    do
      {:ok, length(devices_labels), List.first(all_labels)}
    end
  end

  def create_labels_add_device(device, label_names, organization, user) do
    Repo.transaction(fn ->
      labels = Enum.reduce(label_names, [], fn label_name, acc ->
        # create a label, store the id, and add
        new_label = create_label!(organization, %{"name" => label_name, "creator" => user.email, "organization_id" => organization.id})
        acc ++ [new_label.id]
      end)
      add_labels_to_device(labels, device, organization)
    end)
  end

  defp get_organization_label_count(organization) do
    labels = from(d in Label, where: d.organization_id == ^organization.id) |> Repo.all()
    length(labels)
  end

  def update_config_profile_for_labels(label_ids, config_profile_id, organization_id) do
    from(l in Label, where: l.id in ^label_ids and l.organization_id == ^organization_id)
    |> Repo.update_all(set: [config_profile_id: config_profile_id])
  end
end
