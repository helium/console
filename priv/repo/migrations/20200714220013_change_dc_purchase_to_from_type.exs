defmodule Console.Repo.Migrations.ChangeDcPurchaseToFromType do
  use Ecto.Migration

  def change do
    execute "ALTER TABLE dc_purchases DROP CONSTRAINT dc_purchases_from_organization_fkey"
    execute "ALTER TABLE dc_purchases DROP CONSTRAINT dc_purchases_to_organization_fkey"
    alter table(:dc_purchases) do
      modify :from_organization, :string
      modify :to_organization, :string
    end
  end
end
