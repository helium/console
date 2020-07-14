defmodule Console.Repo.Migrations.AddFromToDcPurchases do
  use Ecto.Migration

  def change do
    alter table(:dc_purchases) do
      add :from_organization, references(:organizations)
      add :to_organization, references(:organizations)
      modify :payment_id, :string, null: true
    end
  end
end
