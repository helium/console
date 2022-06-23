defmodule Console.Functions.Function do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Helpers

  @all_formats ["custom", "cayenne", "browan_object_locator"]

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "functions" do
    field :name, :string
    field :body, :string
    field :type, :string
    field :format, :string
    field :active, :boolean

    belongs_to :organization, Organization

    timestamps()
  end

  @doc false
  def changeset(function, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name", "type", "format"])
    allowed_formats = get_allowed_function_formats()

    function
    |> cast(attrs, [:name, :body, :type, :format, :organization_id, :active])
    |> put_native_decoder_body()
    |> validate_required([:name], message: "Name cannot be blank")
    |> validate_required([:body, :type, :format, :organization_id])
    |> validate_length(:name, max: 50, message: "Name cannot be longer than 50 characters")
    |> validate_inclusion(:type, ~w(decoder))
    |> validate_inclusion(:format, allowed_formats)
    |> unique_constraint(:name, name: :functions_name_organization_id_index, message: "This function name has already been used in this organization")
  end

  def get_allowed_function_formats() do
    case Application.get_env(:console, :allowed_functions) do
      "all" ->
        @all_formats
      value ->
        value
        |> String.trim(",")
        |> String.replace(" ", "")
        |> String.split(",")
    end
  end

  defp put_native_decoder_body(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{ format: format }} ->
        case format do
          "custom" -> changeset
          _ -> put_change(changeset, :body, "default #{format} body")
        end
      _ -> changeset
    end
  end
end
