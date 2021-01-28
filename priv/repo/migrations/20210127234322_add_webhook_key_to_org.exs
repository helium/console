defmodule Console.Repo.Migrations.AddWebhookKeyToOrg do
  use Ecto.Migration

  def up do
    alter table("organizations") do
      add_if_not_exists :webhook_key, :string
    end
    create index(:organizations, [:webhook_key])
  end

  def down do
    drop index(:organizations, [:webhook_key])
    alter table("organizations") do
      remove :webhook_key
    end
  end
end
