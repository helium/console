defmodule Console.Hotspots.Hotspot do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias Console.Groups.HotspotsGroups
  alias Console.Groups.Group

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
    field :owner, :string

    many_to_many :groups, Group, join_through: HotspotsGroups, on_delete: :delete_all

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
      :address,
      :owner
    ])
    |> validate_required([
      :address,
      :name
    ])
    |> unique_constraint(:address, name: :hotspots_address_index, message: "This hotspot address already exists")
  end
end