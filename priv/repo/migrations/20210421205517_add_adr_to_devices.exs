defmodule Console.Repo.Migrations.AddAdrToDevices do
  use Ecto.Migration

  def change do
    alter table(:devices) do
      add :adr_allowed, :boolean, null: false, default: false
    end
  end
end
