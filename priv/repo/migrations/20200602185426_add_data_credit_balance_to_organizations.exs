defmodule Console.Repo.Migrations.AddDataCreditBalanceToOrganizations do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :dc_balance, :bigint
    end
  end
end
