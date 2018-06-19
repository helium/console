defmodule Console.HardwareIdentifiers.HardwareIdentifier do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Gateways.Gateway

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "hardware_identifiers" do
    field :token, :binary

    has_one :gateway, Gateway, on_delete: :delete_all

    timestamps()
  end

  def changeset(hardware_identifier, attrs) do
    hardware_identifier
    |> cast(attrs, [:token])
    |> validate_required([:token])
    |> unique_constraint(:token)
  end
end
