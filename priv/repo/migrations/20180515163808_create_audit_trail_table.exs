defmodule Console.Repo.Migrations.CreateAuditTrailTable do
  use Ecto.Migration

  def change do
    create table(:audit_trails, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, on_delete: :nothing, type: :binary_id)
      add :user_email, :string
      add :object, :string
      add :action, :string
      add :description, :string
      add :team_id, references(:teams, on_delete: :nothing, type: :binary_id)
      add :team_name, :string
      add :target_table, :string
      add :target_id, :binary_id
      add :target_name, :string

      timestamps()
    end

    create index(:audit_trails, [:user_id])
    create index(:audit_trails, [:user_email])
    create index(:audit_trails, [:object])
    create index(:audit_trails, [:action])
    create index(:audit_trails, [:team_id])
    create index(:audit_trails, [:team_name])
    create index(:audit_trails, [:target_id])
    create index(:audit_trails, [:target_name])
  end
end
