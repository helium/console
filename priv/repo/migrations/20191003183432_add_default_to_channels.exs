defmodule Console.Repo.Migrations.AddDefaultToChannels do
  use Ecto.Migration

  def change do
    alter table(:channels) do
      add :default, :boolean
    end
  end
end
