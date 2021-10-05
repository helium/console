defmodule Console.Devices.DeviceResolver do
  alias Console.Repo
  alias Console.Devices.Device
  alias Console.Helpers
  alias Console.Devices.DeviceImports
  alias Console.Events.Event
  alias Console.Labels.DevicesLabels
  import Ecto.Query
  alias Console.Alerts

  def paginate(%{page: page, page_size: page_size, column: column, order: order }, %{context: %{current_organization: current_organization}}) do
    order_by = {String.to_existing_atom(Helpers.order_with_nulls(order)), String.to_existing_atom(column)}

    devices = Device
      |> where([d], d.organization_id == ^current_organization.id)
      |> preload([:labels])
      |> order_by(^order_by)
      |> Repo.paginate(page: page, page_size: page_size)

    entries =
      devices.entries
      |> Enum.map(fn d ->
        Map.drop(d, [:app_key])
      end)

    {:ok, Map.put(devices, :entries, entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization, current_membership: current_membership }}) do
    device = Ecto.assoc(current_organization, :devices) |> Repo.get!(id) |> Repo.preload([:labels, :config_profile])

    device =
      case current_membership.role do
        "read" ->
          device
          |> Map.drop([:app_key])
        _ -> device
      end

    {:ok, device}
  end

  def get_device_stats(%{id: id}, %{context: %{current_organization: current_organization}}) do
    device = Ecto.assoc(current_organization, :devices) |> Repo.get!(id)

    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    unix7d = current_unix - 86400000 * 7
    unix30d = current_unix - 86400000 * 30

    {:ok, device_id} = Ecto.UUID.dump(device.id)
    result = Ecto.Adapters.SQL.query!(
      Console.Repo,
      "(SELECT count(*) FROM device_stats where device_id = $1 and reported_at_epoch > $2) UNION ALL (SELECT count(*) FROM device_stats where device_id = $1 and reported_at_epoch > $3) UNION ALL (SELECT count(*) FROM device_stats where device_id = $1 and reported_at_epoch > $4)",
      [device_id, unix1d, unix7d, unix30d]
    )
    counts = List.flatten(result.rows)

    {
      :ok,
      %{
        packets_last_1d: Enum.at(counts, 0),
        packets_last_7d: Enum.at(counts, 1),
        packets_last_30d: Enum.at(counts, 2),
      }
    }
  end

  def get_device_dc_stats(%{id: id}, %{context: %{current_organization: current_organization}}) do
    device = Ecto.assoc(current_organization, :devices) |> Repo.get!(id)

    current_unix = DateTime.utc_now() |> DateTime.to_unix(:millisecond)
    unix1d = current_unix - 86400000
    unix7d = current_unix - 86400000 * 7
    unix30d = current_unix - 86400000 * 30

    {:ok, device_id} = Ecto.UUID.dump(device.id)
    result = Ecto.Adapters.SQL.query!(
      Console.Repo,
      "(SELECT sum(dc_used) FROM device_stats where device_id = $1 and reported_at_epoch > $2) UNION ALL (SELECT sum(dc_used) FROM device_stats where device_id = $1 and reported_at_epoch > $3) UNION ALL (SELECT sum(dc_used) FROM device_stats where device_id = $1 and reported_at_epoch > $4)",
      [device_id, unix1d, unix7d, unix30d]
    )
    counts = List.flatten(result.rows)

    {
      :ok,
      %{
        dc_last_1d: Enum.at(counts, 0) || 0,
        dc_last_7d: Enum.at(counts, 1) || 0,
        dc_last_30d: Enum.at(counts, 2) || 0,
      }
    }
  end

  def get_device_count(_, %{context: %{current_organization: current_organization}}) do
    query = from d in Device,
      where: d.organization_id == ^current_organization.id,
      select: count(d.id)

    {:ok, %{ count: Repo.one(query) }}
  end

  def get_names(%{device_ids: device_ids}, %{context: %{current_organization: current_organization}}) do
    query = from d in Device,
      where: d.organization_id == ^current_organization.id and d.id in ^device_ids

    {:ok, query |> Repo.all()}
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    devices = Device
      |> where([d], d.organization_id == ^current_organization.id)
      |> Repo.all()
      |> Enum.map(fn d ->
        Map.drop(d, [:app_key])
        |> Map.put(:alerts, Alerts.get_alerts_by_node(d.id, "device"))
      end)

    {:ok, devices}
  end

  def paginate_by_label(%{page: page, page_size: page_size, label_id: label_id, column: column, order: order}, %{context: %{current_organization: current_organization}}) do
    order_by = {String.to_existing_atom(Helpers.order_with_nulls(order)), String.to_existing_atom(column)}

    query = from d in Device,
      join: dl in DevicesLabels,
      on: dl.device_id == d.id,
      where: d.organization_id == ^current_organization.id and dl.label_id == ^label_id,
      preload: [:labels],
      order_by: ^order_by

    devices = query |> Repo.paginate(page: page, page_size: page_size)

    entries = devices.entries
      |> Enum.map(fn d ->
        Map.drop(d, [:app_key])
      end)

    {:ok, Map.put(devices, :entries, entries)}
  end

  def events(%{device_id: id}, %{context: %{current_organization: current_organization}}) do
    device = Device
      |> where([d], d.organization_id == ^current_organization.id and d.id == ^id)
      |> Repo.one!()

    events = Event
      |> where([e], e.device_id == ^device.id)
      |> limit(250)
      |> order_by(desc: :reported_at_naive)
      |> Repo.all()

    events =
      Enum.map(events, fn e ->
        data =
          case e.data do
            nil -> %{}
            _ -> Map.new(e.data, fn {k, v} -> {String.to_atom(k), v}
            end)
          end
        e |> Map.put(:data, Jason.encode!(data))
      end)

    {:ok, events}
  end

  def paginate_device_imports(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    device_imports = DeviceImports
      |> where([di], di.organization_id == ^current_organization.id)
      |> order_by([di], [desc: di.updated_at])
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, device_imports}
  end
end
