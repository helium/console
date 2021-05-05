defmodule Console.Repo.Migrations.AddTypeColToAlertEvents do
  use Ecto.Migration

  def change do
    alter table(:alert_events) do
      add :type, :string, null: false
    end
  end
end
