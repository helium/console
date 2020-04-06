defmodule Console.Repo.Migrations.AddAttributesToChannels do
  use Ecto.Migration

  def change do
    alter table(:events) do
      add :port, :integer
      add :devaddr, :string
    end
  end
end
