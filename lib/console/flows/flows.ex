defmodule Console.Flows do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Flows.Flow
  alias Console.Labels

  def get_flows(organization_id) do
     from(f in Flow, where: f.organization_id == ^organization_id)
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
end
