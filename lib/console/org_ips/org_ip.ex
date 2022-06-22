defmodule Console.OrgIps.OrgIp do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "org_ips" do
    field :address, :string
    field :email, :string
    field :organization_id, :binary_id
    field :organization_name, :string
    field :banned, :boolean

    timestamps()
  end

  @doc false
  def create_changeset(memo, attrs) do
    memo
    |> cast(attrs, [:address, :organization_id, :organization_name, :email, :banned])
  end
end
