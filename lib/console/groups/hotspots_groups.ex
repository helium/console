defmodule Console.Groups.HotspotsGroups do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "hotspots_groups" do
    belongs_to :group, Console.Groups.Group
    belongs_to :hotspot, Console.Hotspots.Hotspot

    timestamps()
  end

  @doc false
  def changeset(hotspots_group, attrs) do
    hotspots_group
    |> cast(attrs, [:group_id, :hotspot_address])
    |> validate_required([:group_id, :hotspot_address])
    |> unique_constraint(:hotspot_address, name: :hotspots_groups_hotspot_address_group_id_index, message: "Hotspot already added to Group")
  end
end
