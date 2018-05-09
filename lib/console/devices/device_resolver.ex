defmodule Console.Devices.DeviceResolver do
  alias Console.Devices
  alias Console.Teams

  def all(_, %{context: %{current_team: current_team}}) do
    current_team = current_team |> Teams.fetch_assoc([devices: :groups])
    {:ok, current_team.devices}
  end

  def find(%{id: id}, %{context: %{current_team: current_team}}) do
    device = Devices.get_device!(id)
    {:ok, device}
  end
end
