defmodule Console.Repo.Migrations.AddActiveToOrganizations do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :active, :boolean, null: false, default: true
    end
  end
end
