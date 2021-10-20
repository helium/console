defmodule Console.Groups.Group do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Hotspots.Hotspot
  alias Console.Groups.HotspotsGroups
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "groups" do
    field :name, :string

    belongs_to :organization, Organization
    many_to_many :hotspots, Hotspot, join_through: HotspotsGroups, on_delete: :delete_all
    timestamps()
  end

  def changeset(group, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    group
    |> cast(attrs, [:name, :organization_id])
    |> validate_required([:name, :organization_id])
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> unique_constraint(:name, name: :groups_name_organization_id_index, message: "This group name has already been used in this organization")
  end
end
