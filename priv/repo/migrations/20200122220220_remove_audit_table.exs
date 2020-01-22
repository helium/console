defmodule Console.Repo.Migrations.RemoveAuditTable do
  use Ecto.Migration

  def change do
    drop table(:audit_trails)
  end
end
