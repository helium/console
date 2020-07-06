defmodule Console.DcPurchases.DcPurchaseResolver do
  alias Console.Repo
  alias Console.DcPurchases.DcPurchase
  alias Console.Organizations.Membership
  import Ecto.Query

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_organization: current_organization}}) do
    purchases = DcPurchase
      |> where([p], p.organization_id == ^current_organization.id)
      |> order_by(desc: :inserted_at)
      |> Repo.paginate(page: page, page_size: page_size)

    distinct_user_ids = Enum.map(purchases.entries, fn p -> p.user_id end) |> Enum.uniq()

    query = from(
      m in Membership,
      distinct: m.user_id,
      where: m.user_id in ^distinct_user_ids
    )
    users = Repo.all(query)

    updated_entries =
      purchases.entries |> Enum.map(fn p ->
        user = Enum.find(users, fn u -> u.user_id == p.user_id end)
        case user do
          nil -> Map.put(p, :user_id, p.user_id)
          _ -> Map.put(p, :user_id, user.email)
        end

      end)

    {:ok,  Map.put(purchases, :entries, updated_entries)}
  end
end
