defmodule Console.ApiKeys.ApiKey do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "api_keys" do
    field :role, :string
    field :name, :string
    field :key, :binary

    belongs_to :user, Console.Auth.User
    belongs_to :organization, Console.Organizations.Organization

    timestamps()
  end

  def create_changeset(api_key, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["role", "name"])
    
    api_key
    |> cast(attrs, [:role, :name, :organization_id, :user_id, :key])
    |> validate_required(:role, message: "Please select a role for your new api key")
    |> validate_inclusion(:role, ~w(admin manager read))
    |> validate_required(:name, message: "Please choose a name for your new api key")
    |> validate_required([:key, :organization_id, :user_id])
  end
end
