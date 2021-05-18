defmodule Console.Repo.Migrations.RemoveLabelColorColumn do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      remove :color
    end
  end
end
