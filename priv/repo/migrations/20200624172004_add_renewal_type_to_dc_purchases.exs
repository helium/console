defmodule Console.Repo.Migrations.AddRenewalTypeToDcPurchases do
  use Ecto.Migration

  def change do
    alter table(:dc_purchases) do
      add :auto, :boolean, null: false, default: false
    end
  end
end
