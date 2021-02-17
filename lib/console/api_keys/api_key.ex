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

    attrs =
      case attrs["name"] do
        nil -> attrs
        _ ->
          name = String.trim(attrs["name"]) |> String.split() |> Enum.join(" ")
          Map.put(attrs, "name", name)
      end

    api_key
    |> cast(attrs, [:role, :name, :organization_id, :user_id, :key])
    |> validate_required(:role, message: "Please select a role for your new API key")
    |> validate_inclusion(:role, ~w(admin))
    |> validate_required(:name, message: "Please choose a name for your new API key")
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> validate_required([:key, :organization_id, :user_id])
    |> unique_constraint(:name, name: :api_keys_name_organization_id_index, message: "This name has already been used in this organization")
    |> check_name
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

  defp check_name(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{name: name}} ->
        valid_name = Helpers.check_special_characters(name)
        case valid_name do
          false -> add_error(changeset, :message, "Please refrain from using special characters in the key name")
          true -> changeset
        end
      _ -> changeset
    end
  end
end
