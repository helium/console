defmodule Console.Repo.Migrations.CreateTwoFactorTable do
  use Ecto.Migration

  def change do
    create table(:twofactors, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :secret, :string
      add :last_verified, :naive_datetime
      add :last_skipped, :naive_datetime
      add :user_id, references(:users, on_delete: :nothing, type: :binary_id)
    end
  end
end
