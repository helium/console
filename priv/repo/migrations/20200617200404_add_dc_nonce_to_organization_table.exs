defmodule Console.Repo.Migrations.AddDcNonceToOrganizationTable do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :dc_balance_nonce, :int, null: false, default: 0
    end
  end
end
