defmodule Console.Repo.Migrations.MakeWebhookKeyNotNullable do
  use Ecto.Migration

  def up do
    alter table("organizations") do
      modify :webhook_key, :string, null: false
    end
  end

  def down do
    alter table("organizations") do
      modify :webhook_key, :string, null: true
    end
  end
end
