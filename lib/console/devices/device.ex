defmodule Console.Devices.Device do
  use Ecto.Schema
  import Ecto.Changeset


  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "devices" do
    field :mac, :string
    field :name, :string
    field :public_key, :binary

    timestamps()
  end

  @doc false
  def changeset(device, attrs) do
    device
    |> cast(attrs, [:name, :mac, :public_key])
    |> validate_required([:name, :mac, :public_key])
    |> unique_constraint(:mac)
  end
end
