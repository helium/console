defmodule Console.Labels do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Labels.ChannelsLabels
  alias Console.Devices.Device
  alias Console.Devices
  alias Console.Channels
  alias Console.Organizations
  alias Console.Organizations.Organization

  def get_organization_label_count(organization) do
    labels = from(d in Label, where: d.organization_id == ^organization.id) |> Repo.all()
    length(labels)
  end

  def get_label!(id), do: Repo.get!(Label, id)
  def get_label!(organization, id) do
     Repo.get_by!(Label, [id: id, organization_id: organization.id])
  end

  def get_labels(organization, ids) do
     from(l in Label, where: l.id in ^ids and l.organization_id == ^organization.id)
     |> Repo.all()
  end

  def get_labels_of_device(device) do
     from(dl in DevicesLabels, where: dl.device_id == ^device.id)
     |> Repo.all()
  end

  def get_label(organization, id) do
     Repo.get_by(Label, [id: id, organization_id: organization.id])
  end

  def fetch_assoc(%Label{} = label, assoc \\ [:devices]) do
    Repo.preload(label, assoc)
  end

  def get_label_by_name(name, organization_id), do: Repo.get_by(Label, [name: name, organization_id: organization_id])

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

    Repo.transaction(fn ->
      from(dl in DevicesLabels, where: dl.label_id in ^label_ids) |> Repo.delete_all()
      from(cl in ChannelsLabels, where: cl.label_id in ^label_ids) |> Repo.delete_all()
      from(l in Label, where: l.id in ^label_ids) |> Repo.delete_all()
    end)
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
      {:ok, length(devices_labels)}
    end
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
      {:ok, length(devices_labels)}
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

  def add_labels_to_channel(labels, channel, organization) do
    labels_query = from(l in Label, where: l.id in ^labels and l.organization_id == ^organization.id, select: l)
    all_labels = Repo.all(labels_query)

    channels_labels = Enum.reduce(all_labels, [], fn label, acc ->
      if Repo.get_by(ChannelsLabels, channel_id: channel.id, label_id: label.id) == nil do
        acc ++ [%{ channel_id: channel.id, label_id: label.id }]
      else
        acc
      end
    end)

    with {:ok, :ok} <- Repo.transaction(fn ->
        Enum.each(channels_labels, fn attrs ->
          Repo.insert!(ChannelsLabels.changeset(%ChannelsLabels{}, attrs))
        end)
      end)
    do
      {:ok, length(channels_labels), List.first(all_labels)}
    end
  end

  def delete_labels_from_channel(labels, channel_id, organization) do
    case Channels.get_channel(organization, channel_id) do
      nil -> {:error}
      _ ->
        query = from(cl in ChannelsLabels, where: cl.label_id in ^labels and cl.channel_id == ^channel_id)
        Repo.delete_all(query)
    end
  end

  def add_function_to_labels(function, label_ids, organization) do
    Repo.transaction(fn ->
      Enum.each(label_ids, fn id ->
        label = get_label!(organization, id)
        update_label(label, %{ "function_id" => function.id })
      end)
    end)
  end

  def create_labels_add_function(function, label_names, organization, user) do
    Repo.transaction(fn ->
      Enum.each(label_names, fn name ->
        create_label(organization, %{ "name" => name, "creator" => user.email, "organization_id" => organization.id, "function_id" => function.id })
      end)
    end)
  end
end
