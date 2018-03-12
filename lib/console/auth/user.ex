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

    timestamps()
  end

  def changeset(user, attrs \\ %{}) do
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
    |> validate_confirmation(:password, message: "passwords do not match")
    |> put_password_hash
    |> put_confirmation_token
  end

  def confirm_email_changeset(user) do
    user
    |> changeset()
    |> put_change(:confirmed_at, DateTime.utc_now)
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
