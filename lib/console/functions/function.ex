defmodule Console.Functions.Function do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization
  alias Console.Labels.Label

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "functions" do
    field :name, :string
    field :body, :string
    field :type, :string
    field :format, :string

    belongs_to :organization, Organization
    has_many :labels, Label
    timestamps()
  end

  @doc false
  def changeset(function, attrs) do
    function
    |> cast(attrs, [
      :name,
      :body,
      :type,
      :format,
      :organization_id
    ])
  end
end
