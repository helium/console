defmodule Console.Repo.Migrations.CreateAuditActionsTable do
  use Ecto.Migration

  def change do
    create table(:audit_actions, primary_key: false) do
      add :id, :binary_id, primary_key: true, null: false
      add :organization_id, :string
      add :user_email, :string
      add :action, :string
      add :data, :map
      add :resource_id, :string

      timestamps()
    end

    create index(:audit_actions, [:action])
    create index(:audit_actions, [:resource_id])
  end
end
