defmodule Console.CardFingerprints.CardFingerprint do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :string, autogenerate: false}
  schema "card_fingerprints" do
    timestamps()
  end

  @doc false
  def create_changeset(cf, attrs) do
    cf
    |> cast(attrs, [:id])
    |> unique_constraint(:id)
  end
end
