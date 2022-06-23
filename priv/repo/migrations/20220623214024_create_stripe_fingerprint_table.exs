defmodule Console.Repo.Migrations.CreateStripeFingerprintTable do
  use Ecto.Migration

  def change do
    create table(:card_fingerprints, primary_key: false) do
      add :id, :string, null: false

      timestamps()
    end

    create unique_index(:card_fingerprints, [:id])
  end
end
