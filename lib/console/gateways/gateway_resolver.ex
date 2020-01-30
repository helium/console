defmodule Console.Gateways.GatewayResolver do
  alias Console.Repo

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    gateways =
      Ecto.assoc(current_organization, :gateways)
      |> Repo.paginate(page: page, page_size: page_size)
    {:ok, gateways}
  end

  def find(%{id: id}, %{context: %{current_organization: current_organization}}) do
    gateway = Ecto.assoc(current_organization, :gateways) |> Repo.get!(id)
    {:ok, gateway}
  end
end
