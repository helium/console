defmodule Console.Gateways.GatewayIdentifier do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Gateways.Gateway

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "gateway_identifiers" do
    field :unique_identifier, :binary

    has_one :gateway, Gateway, on_delete: :delete_all

    timestamps()
  end

  def changeset(gateway_identifier, attrs) do
    gateway_identifier
    |> cast(attrs, [:unique_identifier])
    |> validate_required([:unique_identifier])
  end
end
