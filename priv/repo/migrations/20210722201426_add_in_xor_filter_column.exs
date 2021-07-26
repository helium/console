defmodule Console.Repo.Migrations.AddInXORFilterColumn do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :in_xor_filter, :boolean, null: false, default: false
    end
  end
end
