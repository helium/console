defmodule Console.Groups.HotspotGroup do
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
  def changeset(hotspot_group, attrs) do
    hotspot_group
    |> cast(attrs, [:group_id, :hotspot_id])
    |> validate_required([:group_id, :hotspot_id])
    |> unique_constraint(:hotspot_id, name: :hotspots_groups_hotspot_id_group_id_index, message: "Hotspot already in Group")
  end
end
