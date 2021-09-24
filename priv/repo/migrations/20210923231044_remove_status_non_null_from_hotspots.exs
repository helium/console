defmodule Console.Repo.Migrations.RemoveStatusNonNullFromHotspots do
  use Ecto.Migration

  def change do
    alter table(:hotspots) do
      modify(:status, :string, null: true)
    end
  end
end
