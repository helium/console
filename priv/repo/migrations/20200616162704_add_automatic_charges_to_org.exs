defmodule Console.Repo.Migrations.AddAutomaticChargesToOrg do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :automatic_charge_amount, :int
      add :automatic_payment_method, :string
    end
  end
end
