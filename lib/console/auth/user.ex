defmodule Console.Auth.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers

  @primary_key {:id, :string, []}
  @foreign_key_type :string
  schema "users" do
    field :email, :string
    field :password_hash, :string
    field :password, :string, virtual: true
    field :confirmation_token, :string
    field :confirmed_at, :naive_datetime
    field :last_2fa_skipped_at, :naive_datetime
    field :super, :boolean

    has_many :memberships, Console.Organizations.Membership
    has_many :api_keys, Console.ApiKeys.ApiKey
    many_to_many :organizations, Console.Organizations.Organization, join_through: "memberships"

    timestamps()
  end
end
