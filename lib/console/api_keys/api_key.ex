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
    field :token, :string
    field :active, :boolean, default: false
    field :user_id, :string

    belongs_to :organization, Console.Organizations.Organization

    timestamps()
  end

  def changeset(api_key, attrs \\ %{}) do
    attrs = Helpers.sanitize_attrs(attrs, ["role", "name"])

    api_key
    |> cast(attrs, [:role, :name, :organization_id, :user_id, :key])
    |> validate_required(:role, message: "Please select a role for your new api key")
    |> validate_inclusion(:role, ~w(admin manager read))
    |> validate_required(:name, message: "Please choose a name for your new api key")
    |> validate_required([:key, :organization_id, :user_id])
    |> unique_constraint(:name, name: :api_keys_name_organization_id_index, message: "This name has already been used in this organization")
  end

  def create_changeset(api_key, attrs \\ %{}) do
    api_key
    |> changeset(attrs)
    |> put_token()
  end

  def activate_changeset(api_key) do
    api_key
    |> changeset()
    |> put_change(:active, true)
    |> put_change(:token, nil)
  end

  defp put_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :token, generate_token(64))
      _ -> changeset
    end
  end

  defp generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end
end
