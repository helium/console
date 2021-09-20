defmodule Console.Repo.Migrations.AddErrorToChannels do
  use Ecto.Migration

  def change do
    alter table(:channels) do
      add :last_errored, :boolean, null: false, default: false
    end
  end
end
