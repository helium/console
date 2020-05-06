defmodule Console.Repo.Migrations.AddUniqueNameToFunctions do
  use Ecto.Migration

  def change do
    create unique_index(:functions, [:name, :organization_id])
  end
end
