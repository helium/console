defmodule Console.Repo.Migrations.AddShowDuplicatesBooleanToChannels do
  use Ecto.Migration

  def up do
    alter table(:channels) do
      add :show_dupes, :boolean, null: false, default: false
    end
  end

  def down do
    alter table(:channels) do
      remove :show_dupes, :boolean
    end
  end
end
