defmodule Console.Repo.Migrations.AddTokenAndVerifiedToApiKey do
  use Ecto.Migration

  def change do
    alter table(:api_keys) do
      add :active, :boolean, default: false, null: false
      add :token, :string
    end
  end
end
