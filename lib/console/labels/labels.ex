defmodule Console.Labels do
  import Ecto.Query, warn: false
  alias Console.Repo
  alias Ecto.Multi

  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Labels.ChannelsLabels
  alias Console.Devices.Device
  alias Console.Organizations

  def get_label!(id), do: Repo.get!(Label, id)

  def get_label_by_name(name), do: Repo.get_by(Label, name: name)

  def create_label(attrs \\ %{}) do
    %Label{}
    |> Label.changeset(attrs)
    |> Repo.insert()
  end

  def update_label(%Label{} = label, attrs) do
    label
    |> Label.changeset(attrs)
    |> Repo.update()
  end

  def delete_label(%Label{} = label) do
    Repo.delete(label)
  end

  def delete_labels(label_ids) do
    Repo.transaction(fn ->
      from(dl in DevicesLabels, where: dl.label_id in ^label_ids) |> Repo.delete_all()
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

  def delete_devices_labels(devices, label_id) do
    query = from(dl in DevicesLabels, where: dl.device_id in ^devices and dl.label_id == ^label_id)
    Repo.delete_all(query)
  end

  def add_labels_to_channel(labels, channel, organization) do
    labels_query = from(l in Label, where: l.id in ^labels and l.organization_id == ^organization.id, select: l)
    all_labels = Repo.all(labels_query)

    channels_labels = Enum.reduce(all_labels, [], fn label, acc ->
      acc ++ [%{ channel_id: channel.id, label_id: label.id }]
    end)

    Repo.transaction(fn ->
      Enum.each(channels_labels, fn attrs ->
        Repo.insert!(ChannelsLabels.changeset(%ChannelsLabels{}, attrs))
      end)
    end)
  end
end
