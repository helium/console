defmodule Console.Repo.Migrations.HotspotNullableFields do
  use Ecto.Migration

  def up do
    Ecto.Adapters.SQL.query!(
      Console.Repo, """
        DELETE FROM hotspots WHERE
          height IS NULL OR
          location IS NULL OR
          lat IS NULL OR
          lng IS NULL OR
          short_state IS NULL OR
          short_country IS NULL OR
          long_city IS NULL
      """)
    
    alter table("hotspots") do
      modify :height, :integer, null: true
      modify :location, :string, null: true
      modify :lat, :decimal, null: true
      modify :lng, :decimal, null: true
      modify :short_state, :string, null: true
      modify :short_country, :string, null: true
      modify :long_city, :string, null: true
    end
  end

  def down do
    alter table("hotspots") do
      modify :height, :integer, null: false
      modify :location, :string, null: false
      modify :lat, :decimal, null: false
      modify :lng, :decimal, null: false
      modify :short_state, :string, null: false
      modify :short_country, :string, null: false
      modify :long_city, :string, null: false
    end
  end
end
