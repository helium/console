defmodule Console.Repo.Migrations.ChangeCostToBigIntDCPurchases do
  use Ecto.Migration

  def change do
    alter table("dc_purchases") do
      modify :cost, :bigint, null: false
    end
  end
end
