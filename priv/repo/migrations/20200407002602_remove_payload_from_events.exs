defmodule Console.Repo.Migrations.RemovePayloadFromEvents do
  use Ecto.Migration

  def change do
    alter table(:events) do
      remove :payload, :string
    end
  end
end
