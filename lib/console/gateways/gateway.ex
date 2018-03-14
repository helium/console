defmodule Console.Gateways.Gateway do
  use Ecto.Schema
  import Ecto.Changeset


  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "gateways" do
    field :latitude, :decimal
    field :longitude, :decimal
    field :mac, :string
    field :name, :string
    field :public_key, :binary

    timestamps()
  end

  @doc false
  def changeset(gateway, attrs) do
    gateway
    |> cast(attrs, [:name, :mac, :public_key, :latitude, :longitude])
    |> validate_required([:name, :mac, :public_key, :latitude, :longitude])
    |> unique_constraint(:mac)
  end
end
