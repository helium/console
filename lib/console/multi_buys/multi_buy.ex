defmodule Console.MultiBuys.MultiBuy do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias Console.Devices.Device
  alias Console.Labels.Label
  alias Console.Organizations.Organization
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "multi_buys" do
    field :name, :string
    field :value, :integer

    belongs_to :organization, Organization
    has_many :devices, Device
    has_many :labels, Label
    timestamps()
  end

  def changeset(multi_buy, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    multi_buy
    |> cast(attrs, [:name, :value, :organization_id])
    |> validate_required([:organization_id, :value])
    |> validate_required(:name, message: "Name cannot be blank")
    |> validate_length(:name, min: 3, message: "Name must be at least 3 characters")
    |> validate_length(:name, max: 25, message: "Name cannot be longer than 25 characters")
    |> validate_number(:value, greater_than: 0, less_than: 22)
    |> unique_constraint(:name, name: :multi_buys_name_organization_id_index, message: "This name has already been used in this organization")
  end
end
