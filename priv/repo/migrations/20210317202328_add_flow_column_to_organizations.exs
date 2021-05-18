defmodule Console.Repo.Migrations.AddFlowColumnToOrganizations do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :flow, :map, default: %{}, null: false
    end
  end
end
