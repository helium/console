defmodule Console.Repo.Migrations.AddFreeDcToOrgField do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :received_free_dc, :boolean, null: false, default: false
    end
  end
end
