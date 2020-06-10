defmodule Console.DcPurchases do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.DcPurchases.DcPurchase
  alias Console.Organizations.Organization

  def create_dc_purchase(attrs \\ %{}) do
    %DcPurchase{}
    |> DcPurchase.changeset(attrs)
    |> Repo.insert()
  end
end
