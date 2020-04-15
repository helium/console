defmodule Console.Functions.Function do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Labels.Label
  alias Console.Helpers

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "functions" do
    field :name, :string
    field :body, :string
    field :type, :string
    field :format, :string
    field :active, :boolean

    belongs_to :organization, Organization
    has_many :labels, Label
    timestamps()
  end

  @doc false
  def changeset(function, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    function
    |> cast(attrs, [:name, :body, :type, :format, :organization_id])
    |> put_cayenne_body()
    |> validate_required([:name, :body, :type, :format, :organization_id])
    |> validate_inclusion(:type, ~w(decoder))
    |> validate_inclusion(:format, ~w(custom cayenne))
    |> unique_constraint(:name, name: :functions_name_organization_id_index, message: "This name has already been used in this organization")
  end

  defp put_cayenne_body(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{ format: format }} ->
        case format do
          "cayenne" -> put_change(changeset, :body, "Default Cayenne Function")
          _ -> changeset
        end
      _ -> changeset
    end
  end
end
