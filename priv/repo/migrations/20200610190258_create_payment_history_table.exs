defmodule Console.Repo.Migrations.CreatePaymentHistoryTable do
  use Ecto.Migration

  def change do
    create table(:dc_purchases) do
      add :dc_purchased, :bigint, null: false
      add :cost, :int, null: false
      add :card_type, :string, null: false
      add :last_4, :string, null: false
      add :user_id, :string, null: false
      add :organization_id, references(:organizations), null: false, on_delete: :delete_all

      timestamps()
    end
  end
end
