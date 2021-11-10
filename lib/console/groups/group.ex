defmodule Console.Groups.Group do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Hotspots.Hotspot
  alias Console.Groups.HotspotGroup
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "groups" do
    field :name, :string

    belongs_to :organization, Organization
    many_to_many :hotspots, Hotspot, join_through: HotspotGroup, on_delete: :delete_all
    timestamps()
  end

  def changeset(group, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    group
    |> cast(attrs, [:name, :organization_id])
    |> validate_required(:name, message: "Name cannot be blank")
    |> validate_required([:organization_id])
    |> validate_length(:name, min: 3, message: "Name must be at least 3 characters")
    |> validate_length(:name, max: 25, message: "Name cannot be longer than 25 characters")
    |> unique_constraint(:name, name: :groups_name_organization_id_index, message: "This group name has already been used in this organization")
  end
end
