defmodule Console.Devices.DeviceResolver do
  alias Console.Repo
  alias Console.Devices.Device
  alias Console.Channels
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    devices = Device
      |> where([d], d.organization_id == ^current_organization.id)
      |> preload([:channels])
      |> order_by(asc: :seq_id)
      |> Repo.paginate(page: page, page_size: page_size)

    default_channel = Channels.get_default_channel(current_organization)

    entries = Enum.map(devices.entries, fn d ->
      if length(d.channels) == 0 and default_channel do
        Map.put(d, :channels, [default_channel])
      else
        d
      end
    end)

    {:ok, Map.put(devices, :entries, entries)}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    device = Ecto.assoc(current_organization, :devices) |> Repo.get!(id) |> Repo.preload([:channels])
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
end
