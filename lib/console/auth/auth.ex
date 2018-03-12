defmodule Console.Auth do
  @moduledoc """
  The Auth context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Auth.User

  def get_user_by_id!(id) do
    Repo.get!(User, id)
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  def authenticate(%{"email" => e, "password" => p}) do
    case Repo.get_by(User, email: e) do
      nil -> :error
      user ->
        case verify_password(p, user.password_hash) do
          true -> {:ok, user, sign_token(user)}
          _ -> :error
        end
    end
  end

  def confirm_email(token) do
    case Repo.get_by(User, confirmation_token: token) do
      nil -> :error
      user ->
        case mark_email_confirmed(user) do
          {:ok, _struct} -> :ok
          _ -> :error
        end
    end
  end

  defp verify_password(password, pw_hash) do
    Comeonin.Bcrypt.checkpw(password, pw_hash)
  end

  defp sign_token(user) do
    {:ok, token, _claims} = Console.Guardian.encode_and_sign(user)
    token
  end

  defp mark_email_confirmed(user) do
    user
    |> User.confirm_email_changeset()
    |> Repo.update()
  end
end
