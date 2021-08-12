defmodule Console.Hotspots.Hotspot do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Console.Helpers
  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "hotspots" do
    field :name, :string
    field :status, :string
    field :height, :integer
    field :location, :string
    field :lat, :decimal
    field :lng, :decimal
    field :short_state, :string
    field :short_country, :string
    field :long_city, :string
    field :address, :string

    timestamps()
  end

  def changeset(hotspot, attrs) do
    hotspot
    |> cast(attrs, [
      :name,
      :status,
      :height,
      :location,
      :lat,
      :lng,
      :short_state,
      :short_country,
      :long_city,
      :address
    ])
    |> validate_required([
      :address,
      :name
    ])
  end
end