defmodule Console.Repo.Migrations.AddOnDeleteToDCPurchase do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE dc_purchases DROP CONSTRAINT dc_purchases_organization_id_fkey"
    alter table(:dc_purchases) do
      modify(:organization_id, references(:organizations, on_delete: :delete_all))
    end
  end
end
