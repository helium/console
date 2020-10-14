defmodule Console.Repo.Migrations.AddTemplateToChannelsTable do
  use Ecto.Migration

  def change do
    alter table("channels") do
      add :payload_template, :text
    end
  end
end
