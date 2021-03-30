defmodule Console.Auth.User do
  use Ecto.Schema
  import Ecto.Changeset
  # just using user model for superuser currently

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

  def changeset(user, attrs \\ :empty) do
    user
    |> cast(attrs, [:email])
    |> validate_length(:email, min: 1, max: 255)
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
  end

  def registration_changeset(user, attrs \\ :empty) do
    user
    |> changeset(attrs)
    |> cast(attrs, ~w(password))
    |> validate_length(:password, min: 6)
    |> put_password_hash
  end

  defp put_password_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
        put_change(changeset, :password_hash, Comeonin.Bcrypt.hashpwsalt(pass))
      _ -> changeset
    end
  end
end
