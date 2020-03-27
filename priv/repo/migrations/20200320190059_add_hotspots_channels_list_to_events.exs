defmodule Console.Repo.Migrations.AddHotspotsChannelsListToEvents do
  use Ecto.Migration

  def change do
    alter table(:events) do
      add :hotspots, {:array, :map}
      add :channels, {:array, :map}
    end
  end
end
