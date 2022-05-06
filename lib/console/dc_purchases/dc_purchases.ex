defmodule Console.DcPurchases do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.DcPurchases.DcPurchase
  alias Console.Organizations.Organization
  alias Console.Organizations

  def get_by_payment_id(id) do
    DcPurchase
      |> where([d], d.payment_id == ^id)
      |> Repo.one()
  end

  def create_dc_purchase_update_org(attrs \\ %{}, %Organization{} = organization) do
    Repo.transaction(fn ->
      new_balance =
        case organization.dc_balance do
          nil -> attrs["dc_purchased"]
          _ -> attrs["dc_purchased"] + organization.dc_balance
        end

      organization = Organizations.get_organization_and_lock_for_dc(organization.id)
      organization
      |> Organization.update_changeset(%{ "dc_balance" => new_balance, "dc_balance_nonce" => organization.dc_balance_nonce + 1, "pending_automatic_purchase" => false })
      |> Repo.update!()

      %DcPurchase{}
      |> DcPurchase.changeset(attrs)
      |> Repo.insert!()
    end)
  end

  def create_dc_purchase(attrs \\ %{}) do
    %DcPurchase{}
    |> DcPurchase.changeset(attrs)
    |> Repo.insert()
  end

  def get_last_nonrecurring_dc_purchase(organization) do
    from(
      dc in DcPurchase,
      where: dc.organization_id == ^organization.id and dc.user_id != "Recurring Charge",
      order_by: [desc: :inserted_at],
      limit: 1
    )
    |> Repo.one()
  end
end
