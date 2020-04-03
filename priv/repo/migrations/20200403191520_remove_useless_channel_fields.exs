defmodule Console.Repo.Migrations.RemoveUselessChannelFields do
  use Ecto.Migration

  def change do
    alter table(:channels) do
      remove :show_dupes, :boolean
      remove :default, :boolean
    end
  end
end
