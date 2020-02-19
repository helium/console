defmodule Console.Repo.Migrations.CreateChannelsLabelsTable do
  use Ecto.Migration

  def change do
    create table(:channels_labels) do
      add :channel_id, references(:channels)
      add :label_id, references(:labels)

      timestamps()
    end

    create unique_index(:channels_labels, [:channel_id, :label_id])
  end
end
