defmodule Console.OrganizationHotspots.OrganizationHotspot do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "organization_hotspots" do
    field :hotspot_address, :string
    field :claimed, :boolean
    field :alias, :string

    belongs_to :organization, ConsoleOrganization

    timestamps()
  end

  def changeset(hotspot, attrs) do
    hotspot
    |> cast(attrs, [
      :hotspot_address,
      :claimed,
      :alias,
      :organization_id
    ])
    |> unique_constraint(:address, name: :organization_hotspots_organization_id_hotspot_address_index, message: "This hotspot address entry already exists for this organization")
  end
end
