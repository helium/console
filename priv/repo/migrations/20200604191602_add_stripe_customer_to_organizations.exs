defmodule Console.Repo.Migrations.AddStripeCustomerToOrganizations do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :stripe_customer_id, :string
    end
  end
end
