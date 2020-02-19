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
      |> preload([:labels])
      |> order_by(asc: :seq_id)
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, devices}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    device = Ecto.assoc(current_organization, :devices) |> Repo.get!(id)
    key = device.key
      |> :base64.decode
      |> :erlang.binary_to_list()
      |> Enum.map(fn b -> :io_lib.format("~2.16.0B", [b]) |> to_string() end)

    device = Map.put(device, :key, key)
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
