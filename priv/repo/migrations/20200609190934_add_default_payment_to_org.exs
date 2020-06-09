defmodule Console.Repo.Migrations.AddDefaultPaymentToOrg do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :default_payment_id, :string
    end
  end
end
