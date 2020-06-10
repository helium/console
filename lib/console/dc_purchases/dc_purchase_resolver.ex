defmodule Console.DcPurchases.DcPurchaseResolver do
  alias Console.Repo
  alias Console.DcPurchases.DcPurchase
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    purchases = DcPurchase
      |> where([p], p.organization_id == ^current_organization.id)
      |> order_by(desc: :inserted_at)
      |> Repo.paginate(page: page, page_size: page_size)

    {:ok, purchases}
  end
end
