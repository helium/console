defmodule Console.Repo.Migrations.AddUniqueIndexToChannelName do
  use Ecto.Migration

  def change do
    create unique_index(:channels, [:name, :organization_id])
  end
end
