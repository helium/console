defmodule Console.Repo.Migrations.CreateAcceptedTerms do
  use Ecto.Migration

  def change do
    create table(:accepted_terms) do
      add :organization_id, :string, null: false
      add :organization_name, :string, null: false
      add :email, :string, null: false
      add :version, :string, null: false

      timestamps()
    end
  end
end
