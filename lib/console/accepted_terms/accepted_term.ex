defmodule Console.AcceptedTerms.AcceptedTerm do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "accepted_terms" do
    field :email, :string
    field :version, :string

    timestamps()
  end

  def changeset(term, attrs) do
    term
    |> cast(attrs, [:email, :version])
    |> validate_required([:email, :version])
    |> unique_constraint(:email, name: :accepted_terms_email_version_index, message: "Terms have already been accepted")
  end
end
