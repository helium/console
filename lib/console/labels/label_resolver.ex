defmodule Console.Labels.LabelResolver do
  alias Console.Repo
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size, column: column, order: order}, %{context: %{current_organization: current_organization}}) do
    order_by = {String.to_existing_atom(order), String.to_existing_atom(column)}

    labels = Label
      |> where([l], l.organization_id == ^current_organization.id)
      |> preload([:devices, :channels, :function, :label_notification_settings, :label_notification_webhooks])
      |> order_by(^order_by)
      |> Repo.paginate(page: page, page_size: page_size)

    entries = labels.entries
      |> Enum.map(fn l ->
        devices = l.devices
          |> Enum.map(fn d ->
            Map.drop(d, [:app_key])
          end)

        channels = l.channels
          |> Enum.map(fn c ->
            Map.drop(c, [:downlink_token])
          end)
        l
        |> Map.put(:devices, devices)
        |> Map.put(:channels, channels)
      end)

    {:ok, Map.put(labels, :entries, entries)}
  end

  def paginate_by_device(%{page: page, page_size: page_size, device_id: device_id, column: column, order: order}, %{context: %{current_organization: current_organization}}) do
    order_by = {String.to_existing_atom(order), String.to_existing_atom(column)}

    query = from l in Label,
      join: dl in DevicesLabels,
      on: dl.label_id == l.id,
      where: l.organization_id == ^current_organization.id and dl.device_id == ^device_id,
      preload: [:channels, :function],
      order_by: ^order_by

    labels = query |> Repo.paginate(page: page, page_size: page_size)
    entries = labels.entries
      |> Enum.map(fn l ->
        channels = l.channels
          |> Enum.map(fn c ->
            Map.drop(c, [:downlink_token])
          end)
        Map.put(l, :channels, channels)
      end)

    {:ok, Map.put(labels, :entries, entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    label = Ecto.assoc(current_organization, :labels) |> preload([:channels, :devices, :function, :label_notification_settings, :label_notification_webhooks]) |> Repo.get!(id)

    devices = label.devices
      |> Enum.map(fn d ->
        Map.drop(d, [:app_key])
      end)
    channels = label.channels
      |> Enum.map(fn c ->
        Map.drop(c, [:downlink_token])
      end)

    {:ok, label |> Map.put(:devices, devices) |> Map.put(:channels, channels)}
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
      |> preload([:channels, :function, :label_notification_settings, :label_notification_webhooks])
      |> Repo.all()
      |> Enum.map(
        fn label ->
          %{device_count: device_count} = device_counts
            |> Enum.find(
              fn rec ->
                rec.label_id == label.id
              end)

          label |> Map.put(:device_count, device_count)
      end)
      |> Enum.map(fn l ->
        channels = l.channels
          |> Enum.map(fn c ->
            Map.drop(c, [:downlink_token])
          end)
        Map.put(l, :channels, channels)
      end)

    {:ok, labels}
  end
end
