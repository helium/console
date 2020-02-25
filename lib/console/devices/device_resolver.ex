defmodule Console.Devices.DeviceResolver do
  alias Console.Repo
  alias Console.Devices.Device
  alias Console.Labels.Label
  alias Console.Labels.DevicesLabels
  alias Console.Channels
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    devices = Device
      |> where([d], d.organization_id == ^current_organization.id)
      |> preload([labels: [:channels]])
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
    device = Ecto.assoc(current_organization, :devices) |> Repo.get!(id)
    {:ok, device}
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
      preload: [:labels]

    {:ok, query |> Repo.paginate(page: page, page_size: page_size)}
  end
end
