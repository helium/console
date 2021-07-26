defmodule Console.Flows.FlowResolver do
  alias Console.Repo
  alias Console.Flows.Flow
  alias Console.Labels
  alias Console.Devices
  import Ecto.Query

  def get_by_device(%{device_id: device_id}, %{context: %{current_organization: current_organization}}) do
    labels = Labels.get_device_labels(device_id)
    label_ids = Enum.map(labels, fn (l) -> l.label_id end)

    # includes flows specific for the device and flows with the device's labels
    query = from f in Flow,
    where: f.organization_id == ^current_organization.id and (f.device_id == ^device_id or f.label_id in ^label_ids),
    select: %{id: f.id, device_id: f.device_id, label_id: f.label_id, function_id: f.function_id, channel_id: f.channel_id}

    {:ok, Repo.all(query)}
  end
end
