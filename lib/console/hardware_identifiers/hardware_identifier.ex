defmodule Console.HardwareIdentifiers.HardwareIdentifier do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  alias Console.Repo
  alias Console.Gateways.Gateway
  alias Console.HardwareIdentifiers.HardwareIdentifier

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "hardware_identifiers" do
    field :token, :binary

    has_one :gateway, Gateway, on_delete: :delete_all

    timestamps()
  end

  def changeset(hardware_identifier) do
    token = :crypto.strong_rand_bytes(4)

    result = hardware_identifier
    |> change(token: token)
    |> validate_required([:token])
    |> unique_constraint(:token)
  end

  def get_associated_resource(token, resource) do
    query = from r in resource,
      left_join: h in HardwareIdentifier,
      where: h.token == ^token

    Repo.one(query)
  end
end
