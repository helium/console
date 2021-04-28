defmodule Console.MultiBuys.MultiBuy do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "multi_buys" do
    field :name, :string
    field :value, :integer

    belongs_to :organization, Organization
    timestamps()
  end

  def changeset(alert, attrs) do
    alert
    |> cast(attrs, [:name, :value])
    |> validate_required([:organization_id, :value])
    |> validate_required(:name, message: "Name cannot be blank")
    |> validate_length(:name, max: 25, message: "Name cannot be longer than 25 characters")
    |> validate_number(:value, greater_than: 0, less_than: 11)
  end
end
