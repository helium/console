defmodule Console.Devices.DeviceResolver do
  alias Console.Repo
  alias Console.Devices.Device
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    devices = Device
      |> where([d], d.organization_id == ^current_organization.id)
      |> order_by(asc: :seq_id)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, devices}
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
end
