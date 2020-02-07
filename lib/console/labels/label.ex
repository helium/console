defmodule Console.Labels.Label do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "labels" do
    field :name, :string

    belongs_to :organization, Organization
    timestamps()
  end

  def changeset(device, attrs) do
    changeset =
      device
      |> cast(attrs, [:name, :organization_id])
      |> validate_required([:name, :organization_id])
      |> unique_constraint(:name, name: :labels_name_organization_id_index)
  end
end
