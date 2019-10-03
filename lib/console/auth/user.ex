defmodule Console.Auth.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "users" do
    field :email, :string
    field :password_hash, :string
    field :password, :string, virtual: true
    field :confirmation_token, :string
    field :confirmed_at, :naive_datetime
    field :last_2fa_skipped_at, :naive_datetime

    has_one :twofactor, Console.Auth.TwoFactor
    has_many :memberships, Console.Teams.Membership
    many_to_many :teams, Console.Teams.Team, join_through: "memberships"
    many_to_many :organizations, Console.Teams.Organization, join_through: "memberships"

    timestamps()
  end

  def changeset(user, attrs \\ %{}) do
    user
    |> cast(attrs, [:email])
    |> validate_required(:email, message: "Email needs to not be blank")
    |> validate_length(:email, min: 1, max: 255, message: "Email needs to be between 1 and 255 characters long")
    |> validate_format(:email, ~r/@/, message: "Email needs to have an @ sign to be valid")
    |> unique_constraint(:email, message: "Email has already been taken, please log in instead")
  end

  def registration_changeset(user, attrs \\ :empty) do
    user
    |> changeset(attrs)
    |> cast(attrs, ~w(password))
    |> validate_required(:password, message: "Password needs to not be blank")
    |> validate_length(:password, min: 6, message: "Password needs to be 6 characters minimum")
    |> validate_confirmation(:password, message: "Password and password confirmation do not match")
    |> put_password_hash
    |> put_confirmation_token
  end

  def confirm_email_changeset(user) do
    user
    |> changeset()
    |> put_change(:confirmed_at, NaiveDateTime.utc_now())
    |> put_change(:confirmation_token, "Verified")
  end

  def change_password_changeset(user, attrs) do
    user
    |> cast(attrs, ~w(password))
    |> validate_required(:password, message: "Password needs to not be blank")
    |> validate_length(:password, min: 6, message: "Password needs to be 6 characters minimum")
    |> validate_confirmation(:password, message: "Password and password confirmation do not match")
    |> put_password_hash
  end

  def generate_new_confirmation_changeset(user) do
    user
    |> changeset()
    |> put_confirmation_token()
  end

  def update_2fa_last_skipped_changeset(user) do
    user
    |> changeset()
    |> put_change(:last_2fa_skipped_at, NaiveDateTime.utc_now())
  end

  defp put_password_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
        put_change(changeset, :password_hash, Comeonin.Bcrypt.hashpwsalt(pass))
      _ -> changeset
    end
  end

  defp put_confirmation_token(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        put_change(changeset, :confirmation_token, generate_token(64))
      _ -> changeset
    end
  end

  defp generate_token(length) do
    :crypto.strong_rand_bytes(length)
    |> Base.url_encode64
    |> binary_part(0, length)
  end
end
