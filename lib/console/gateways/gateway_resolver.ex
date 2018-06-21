defmodule Console.Gateways.GatewayResolver do
  alias Console.Repo
  alias Console.Gateways

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

  def get_qr_data(%{id: id}, %{context: %{current_team: current_team}}) do
    nonce = Gateways.generate_registration_nonce(id)

    {:ok,
      %{
        id: id,
        nonce: nonce,
        oui: "AAAAAAI=",
        payee_address: current_team.address_b58,
        p2p_address: "www.p2p.helium.com"
      }
    }
  end
end
