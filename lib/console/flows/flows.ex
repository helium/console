defmodule Console.Flows do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Flows.Flow
  alias Console.Labels
  alias Console.Devices

  def get_flows(organization_id) do
     from(f in Flow, where: f.organization_id == ^organization_id)
     |> Repo.all()
  end

  def get_flows_with_device_id(organization_id, device_id) do
     from(f in Flow, where: f.organization_id == ^organization_id and f.device_id == ^device_id)
     |> Repo.all()
  end

  def get_flows_with_label_id(organization_id, label_id) do
     from(f in Flow, where: f.organization_id == ^organization_id and f.label_id == ^label_id)
     |> Repo.all()
  end

  def get_flows_with_channel_id(organization_id, channel_id) do
     from(f in Flow, where: f.organization_id == ^organization_id and f.channel_id == ^channel_id)
     |> Repo.all()
  end

  def get_flows_with_function_id(organization_id, function_id) do
     from(f in Flow, where: f.organization_id == ^organization_id and f.function_id == ^function_id)
     |> Repo.all()
  end

  def create_flow(attrs \\ %{}) do
    %Flow{}
    |> Flow.changeset(attrs)
    |> Repo.insert()
  end

  def delete_flow(%Flow{} = flow) do
    Repo.delete(flow)
  end

  def get_all_flows_associated_device_ids(flows) do
    device_ids = flows |> Enum.filter(fn f -> f.device_id != nil end) |> Enum.map(fn f -> f.device_id end)
    label_ids = flows |> Enum.filter(fn f -> f.label_id != nil end) |> Enum.map(fn f -> f.label_id end)
    label_device_ids = Labels.get_labels_and_attached_devices(label_ids) |> Enum.map(fn l -> l.devices end) |> List.flatten() |> Enum.map(fn d -> d.id end)
    device_ids ++ label_device_ids |> Enum.uniq()
  end

  def get_number_devices_in_flows_with_channel(current_organization, channel_id) do
   query = from f in Flow,
      where: f.organization_id == ^current_organization.id and (f.channel_id == ^channel_id),
      select: %{id: f.id, device_id: f.device_id, label_id: f.label_id, function_id: f.function_id, channel_id: f.channel_id}
   flows = Repo.all(query)
   labels = flows |> Enum.filter(fn f -> f.label_id != nil end) |> Enum.map(fn f -> f.label_id end)
   devices = flows |> Enum.filter(fn f -> f.device_id != nil end) |> Enum.map(fn f -> f.device_id end)
   devices_in_labels = Devices.get_devices_for_labels(labels) |> Enum.map(fn d -> d.id end)
   devices_in_labels |> Enum.concat(devices) |> Enum.uniq() |> length()
  end
end
