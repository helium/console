defmodule Console.Gateways.GatewayResolver do
  alias Console.Repo

  def find(%{id: id}, %{context: %{current_team: current_team}}) do
    gateway = Ecto.assoc(current_team, :gateways) |> Repo.get!(id)
    {:ok, gateway}
  end
end
