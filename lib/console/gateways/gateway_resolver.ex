defmodule Console.Gateways.GatewayResolver do
  alias Console.Repo

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_team: current_team}}) do
    gateways =
      Ecto.assoc(current_team, :gateways)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, gateways}
  end

  def find(%{id: id}, %{context: %{current_team: current_team}}) do
    gateway = Ecto.assoc(current_team, :gateways) |> Repo.get!(id)
    {:ok, gateway}
  end
end
