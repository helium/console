defmodule Console.Devices.DeviceResolver do
  alias Console.Repo

  def all(_, %{context: %{current_team: current_team}}) do
    devices = Ecto.assoc(current_team, :devices) |> Repo.all()
    {:ok, devices}
  end

  def find(%{id: id}, %{context: %{current_team: current_team}}) do
    device = Ecto.assoc(current_team, :devices) |> Repo.get!(id)
    {:ok, device}
  end
end
