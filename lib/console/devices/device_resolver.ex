defmodule Console.Devices.DeviceResolver do
  alias Console.Repo
  alias Console.Devices.Device
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    devices = Device
      |> where([d], d.team_id == ^current_team.id)
      |> order_by(asc: :seq_id)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, devices}
  end

  def find(%{id: id}, %{context: %{current_team: current_team}}) do
    device = Ecto.assoc(current_team, :devices) |> Repo.get!(id) |> Repo.preload([:channels])
    key = device.key
      |> :base64.decode
      |> :erlang.binary_to_list()
      |> Enum.map(fn b -> :io_lib.format("0x~.16B", [b]) |> to_string() end)
      |> Enum.join(", ")

    device = Map.put(device, :key, key)
    {:ok, device}
  end
end
