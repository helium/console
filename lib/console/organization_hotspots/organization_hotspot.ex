defmodule Console.OrganizationHotspots.OrganizationHotspot do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias Console.Organizations.Organization
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "organization_hotspots" do
    field :hotspot_address, :string
    field :claimed, :boolean
    field :alias, :string

    belongs_to :organization, Organization

    timestamps()
  end

  def changeset(hotspot, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["alias"])

    hotspot
    |> cast(attrs, [
      :hotspot_address,
      :claimed,
      :alias,
      :organization_id
    ])
    |> validate_length(:alias, max: 50)
    |> unique_constraint(:address, name: :organization_hotspots_organization_id_hotspot_address_index, message: "This hotspot has already been claimed for this organization")
  end
end
