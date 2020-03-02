defmodule Console.Gateways.Gateway do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Helpers
  alias Console.HardwareIdentifiers.HardwareIdentifier

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "gateways" do
    field :latitude, :decimal
    field :longitude, :decimal
    field :mac, :string
    field :name, :string
    field :location, :string
    field :public_key, :binary
    field :status, :string

    belongs_to :hardware_identifier, HardwareIdentifier

    timestamps()
  end

  def changeset(gateway, attrs) do
    gateway
    |> cast(attrs, [:name, :mac, :public_key, :latitude, :longitude, :status, :hardware_identifier_id])
    |> validate_required([:name, :mac, :latitude, :longitude, :status, :hardware_identifier_id])
    |> validate_inclusion(:status, ["verified", "pending"])
    |> putGeocodingLocation()
    |> unique_constraint(:mac)
  end

  defp putGeocodingLocation(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{ latitude: lat, longitude: lng}} ->
        put_change(changeset, :location, Helpers.geocodeLatLng(lat, lng))
      _ -> changeset
    end
  end
end
