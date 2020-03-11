defmodule Console.Repo.Migrations.AddMoreIndicesToApiKeys do
  use Ecto.Migration

  def change do
    create index(:api_keys, [:user_id])
    create unique_index(:api_keys, [:token])
  end
end
