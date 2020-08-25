defmodule Console.Repo.Migrations.ChangeMemoFieldStorage do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      remove :memo
    end

    create table(:memos) do
      add :memo, :string, null: false
      add :organization_id, references(:organizations), null: false, on_delete: :delete_all

      timestamps()
    end

    create unique_index(:memos, [:memo])
  end
end
