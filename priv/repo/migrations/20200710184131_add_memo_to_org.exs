defmodule Console.Repo.Migrations.AddMemoToOrg do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :memo, :string
      add :memo_created_at, :naive_datetime
    end
  end
end
