defmodule Console.Repo.Migrations.AddActiveToFunctionsTable do
  use Ecto.Migration

  def change do
    alter table(:functions) do
      add :active, :boolean, default: true, null: false
    end
  end
end
