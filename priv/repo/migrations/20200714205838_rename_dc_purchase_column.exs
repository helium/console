defmodule Console.Repo.Migrations.RenameDCPurchaseColumn do
  use Ecto.Migration

  def change do
    rename table("dc_purchases"), :stripe_payment_id, to: :payment_id
  end
end
