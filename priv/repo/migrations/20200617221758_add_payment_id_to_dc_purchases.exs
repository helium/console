defmodule Console.Repo.Migrations.AddPaymentIdToDcPurchases do
  use Ecto.Migration

  def change do
    alter table(:dc_purchases) do
      add :stripe_payment_id, :string, null: false
    end

    create unique_index(:dc_purchases, [:stripe_payment_id])
  end
end
