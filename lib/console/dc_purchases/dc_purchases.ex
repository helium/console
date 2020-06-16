defmodule Console.DcPurchases do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.DcPurchases.DcPurchase
  alias Console.Organizations.Organization
  alias Console.Organizations

  def create_dc_purchase(attrs \\ %{}, %Organization{} = organization) do
    Repo.transaction(fn ->
      new_balance =
        case organization.dc_balance do
          nil -> attrs["dc_purchased"]
          _ -> attrs["dc_purchased"] + organization.dc_balance
        end

      organization = Organizations.get_organization_and_lock_for_dc_purchase(organization.id)
      organization
      |> Organization.update_changeset(%{ "dc_balance" => new_balance })
      |> Repo.update()

      %DcPurchase{}
      |> DcPurchase.changeset(attrs)
      |> Repo.insert()
    end)
  end
end
