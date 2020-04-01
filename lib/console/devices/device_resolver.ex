defmodule Console.Devices.DeviceResolver do
  alias Console.Repo
  alias Console.Devices.Device
  alias Console.Events.Event
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Channels
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    devices = Device
      |> where([d], d.organization_id == ^current_organization.id)
      |> preload([labels: [:channels, :devices]])
      |> order_by(asc: :dev_eui)
      |> Repo.paginate(page: page, page_size: page_size)

    entries =
      Enum.map(devices.entries, fn d ->
        channels =
          Enum.map(d.labels, fn l ->
            l.channels
          end)
          |> List.flatten()
          |> Enum.uniq()

        Map.put(d, :channels, channels)
      end)

    {:ok, Map.put(devices, :entries, entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    device = Ecto.assoc(current_organization, :devices) |> Repo.get!(id) |> Repo.preload([labels: [:channels]])

    query1 = from e in Event, where: e.device_id == ^device.id, select: count(e)
    query2 = from e in Event, where: e.device_id == ^device.id, select: count(e), union_all: ^query1
    query3 = from e in Event, where: e.device_id == ^device.id, select: count(e), union_all: ^query2
    [packets_last_1d, packets_last_7d, packets_last_30d] = Repo.all(query3)

    {:ok,
      Map.merge(device, %{
        packets_last_1d: packets_last_1d,
        packets_last_7d: packets_last_7d,
        packets_last_30d: packets_last_30d,
      })
    }
  end

  def all(_, %{context: %{current_organization: current_organization}}) do
    devices = Device
      |> where([d], d.organization_id == ^current_organization.id)
      |> Repo.all()

    {:ok, devices}
  end

  def paginate_by_label(%{page: page, page_size: page_size, label_id: label_id}, %{context: %{current_organization: current_organization}}) do
    query = from d in Device,
      join: dl in DevicesLabels,
      on: dl.device_id == d.id,
      where: d.organization_id == ^current_organization.id and dl.label_id == ^label_id,
      preload: [labels: [:channels]]

    {:ok, query |> Repo.paginate(page: page, page_size: page_size)}
  end

  def events(%{device_id: id}, %{context: %{current_organization: current_organization}}) do
    device = Device
      |> where([d], d.organization_id == ^current_organization.id and d.id == ^id)
      |> Repo.one()

    events = Event
      |> where([e], e.device_id == ^device.id)
      |> limit(100)
      |> order_by(desc: :reported_at_naive)
      |> Repo.all()

    events =
      Enum.map(events, fn e ->
        e_hotspots =
          case e.hotspots do
            nil -> []
            _ ->
              Enum.map(e.hotspots, fn h ->
                Map.new(h, fn {k, v} -> {String.to_atom(k), v} end)
              end)
          end

        e_channels =
          case e.channels do
            nil -> []
            _ ->
              Enum.map(e.channels, fn c ->
                Map.new(c, fn {k, v} -> {String.to_atom(k), v} end)
              end)
          end

        e |> Map.put(:hotspots, e_hotspots) |> Map.put(:channels, e_channels)
      end)

    {:ok, events}
  end
end
