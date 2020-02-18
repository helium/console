defmodule Console.Labels.Label do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Devices.Device
  alias Console.Labels.DevicesLabels

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "labels" do
    field :name, :string
    field :color, :string

    belongs_to :organization, Organization
    many_to_many :devices, Device, join_through: DevicesLabels, on_delete: :delete_all
    timestamps()
  end

  def changeset(label, attrs) do
    attrs =
      case attrs["name"] do
        nil -> attrs
        _ -> Map.put(attrs, "name", String.upcase(attrs["name"]))
      end

    changeset =
      label
      |> cast(attrs, [:name, :organization_id, :color])
      |> validate_required([:name, :organization_id])
      |> unique_constraint(:name, name: :labels_name_organization_id_index, message: "Label already exists, please use another name.")
  end
end
