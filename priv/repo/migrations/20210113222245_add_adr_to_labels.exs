defmodule Console.Repo.Migrations.AddAdrToLabels do
  use Ecto.Migration

  def change do
    alter table(:labels) do
      add :adr_enabled, :boolean, null: false, default: false
    end
  end
end
