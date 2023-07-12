defmodule Console.Repo.Migrations.CreateAcceptedTerms do
  use Ecto.Migration

  def change do
    create table(:accepted_terms) do
      add :email, :string, null: false
      add :version, :string, null: false

      timestamps()
    end

    create unique_index(:accepted_terms, [:email, :version])
  end
end
