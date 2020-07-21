defmodule Console.Repo.Migrations.RemoveMemoCreatedAt do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      remove :memo_created_at
    end
  end
end
