defmodule Console.DcPurchases.DcPurchase do
  use Ecto.Schema
  import Ecto.Changeset

  alias Console.Organizations.Organization

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "dc_purchases" do
    field :dc_purchased, :integer
    field :cost, :integer
    field :card_type, :string
    field :last_4, :string
    field :user_id, :string
    field :payment_id, :string
    field :from_organization, :string
    field :to_organization, :string

    belongs_to :organization, Organization
    timestamps()
  end

  @doc false
  def changeset(dc_purchase, attrs) do
    dc_purchase
    |> cast(attrs, [:dc_purchased, :cost, :card_type, :last_4, :organization_id, :user_id, :payment_id, :from_organization, :to_organization])
    |> validate_required([:dc_purchased, :cost, :card_type, :last_4, :organization_id, :user_id])
    |> unique_constraint(:payment_id, name: :dc_purchases_stripe_payment_id_index, message: "That payment has already been processed.")
  end
end
