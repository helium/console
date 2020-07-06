defmodule Console.Repo.Migrations.AddPendingAutomaticPurchaseToOrg do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :pending_automatic_purchase, :boolean, null: false, default: false
    end
  end
end
