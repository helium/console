defmodule Console.Repo.Migrations.AddWebhookKeyToOrg do
  use Ecto.Migration

  def change do
    alter table("organizations") do
      add_if_not_exists :webhook_key, :string
    end
    create index(:organizations, [:webhook_key])
  end
end
