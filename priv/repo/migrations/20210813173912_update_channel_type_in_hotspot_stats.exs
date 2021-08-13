defmodule Console.Repo.Migrations.UpdateChannelTypeInHotspotStats do
  use Ecto.Migration

  def up do
    Ecto.Adapters.SQL.query!(
      Console.Repo, """
        ALTER TABLE hotspot_stats
          ALTER COLUMN channel TYPE INTEGER USING (channel::integer);
      """)
  end

  def down do
    Ecto.Adapters.SQL.query!(
      Console.Repo, """
        ALTER TABLE hotspot_stats
          ALTER COLUMN channel TYPE VARCHAR(255);
      """)
  end
end
