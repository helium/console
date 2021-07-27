defmodule Console.Labels.LabelResolver do
  alias Console.Repo
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  import Ecto.Query
  alias Console.Alerts

  def paginate_by_device(%{page: page, page_size: page_size, device_id: device_id, column: column, order: order}, %{context: %{current_organization: current_organization}}) do
    order_by = {String.to_existing_atom(order), String.to_existing_atom(column)}

    query = from l in Label,
      join: dl in DevicesLabels,
      on: dl.label_id == l.id,
      where: l.organization_id == ^current_organization.id and dl.device_id == ^device_id,
      order_by: ^order_by

    labels = query |> Repo.paginate(page: page, page_size: page_size)

    {:ok, labels}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    label = Ecto.assoc(current_organization, :labels) |> preload([:devices]) |> Repo.get!(id)

    devices = label.devices
      |> Enum.map(fn d ->
        Map.drop(d, [:app_key])
      end)

    {:ok, label |> Map.put(:devices, devices)}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    device_count_query = from l in Label,
      left_join: d in assoc(l, :devices),
      where: l.organization_id == ^current_organization.id,
      group_by: l.id,
      select: %{label_id: l.id, device_count: count(d.id)}

    device_counts = Repo.all(device_count_query)

    labels = Label
      |> where([l], l.organization_id == ^current_organization.id)
      |> preload([:devices])
      |> Repo.all()
      |> Enum.map(
        fn label ->
          %{device_count: device_count} = device_counts
            |> Enum.find(
              fn rec ->
                rec.label_id == label.id
              end)

          label |> Map.put(:device_count, device_count) |> Map.put(:alerts, Alerts.get_alerts_by_node(label.id, "label"))
      end)

    {:ok, labels}
  end

  def get_names(%{label_ids: label_ids}, %{context: %{current_organization: current_organization}}) do
    query = from l in Label,
      where: l.organization_id == ^current_organization.id and l.id in ^label_ids

    {:ok, query |> Repo.all()}
  end
end
