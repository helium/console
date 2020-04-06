defmodule Console.Repo.Migrations.RemoveUnusedColumnsFromEvents do
  use Ecto.Migration

  def change do
    alter table(:events) do
      remove :hotspot_name, :string
      remove :channel_name, :string
      remove :status, :string
      remove :rssi, :float
      remove :snr, :float
    end
  end
end
