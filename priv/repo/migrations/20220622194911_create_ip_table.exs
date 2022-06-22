defmodule Console.Repo.Migrations.CreateIpTable do
  use Ecto.Migration

  def change do
    create table(:org_ips) do
      add :address, :string, null: false
      add :email, :string, null: false
      add :organization_id, :binary_id, null: false
      add :organization_name, :string, null: false
      add :banned, :boolean, null: false, default: false

      timestamps()
    end

    create index(:org_ips, [:banned])
  end
end
