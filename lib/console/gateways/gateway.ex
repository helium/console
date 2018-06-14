defmodule Console.Gateways.Gateway do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Teams.Team
  alias Console.Events.Event
  alias Console.Helpers

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

    belongs_to :team, Team
    has_many :events, Event, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(gateway, attrs) do
    gateway
    |> cast(attrs, [:name, :mac, :public_key, :latitude, :longitude, :team_id, :status])
    |> validate_required([:name, :mac, :public_key, :latitude, :longitude, :team_id, :status])
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
