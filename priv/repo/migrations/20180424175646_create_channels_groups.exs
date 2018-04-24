defmodule Console.Repo.Migrations.CreateChannelsGroups do
  use Ecto.Migration

  def change do
    create table(:channels_groups) do
      add :channel_id, references(:channels)
      add :group_id, references(:groups)

      timestamps()
    end

    create unique_index(:channels_groups, [:channel_id, :group_id])
  end
end
