defmodule Console.Repo.Migrations.AddRxDelayToConfigProfile do
  use Ecto.Migration

  def change do
    alter table(:config_profiles) do
      add :rx_delay, :integer, null: false, default: 1
    end
  end
end
