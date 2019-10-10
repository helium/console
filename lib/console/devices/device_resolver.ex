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
    {:ok, device}
  end
end
