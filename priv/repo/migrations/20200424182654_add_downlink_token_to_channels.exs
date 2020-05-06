defmodule Console.Repo.Migrations.AddDownlinkTokenToChannels do
  use Ecto.Migration

  def change do
    alter table(:channels) do
      add :downlink_token, :string
    end

    create unique_index(:channels, [:downlink_token])
  end
end
