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

  def authenticate(%{"email" => email, "password" => password}) do
    case get_user_for_authentication(email) do
      nil -> {:error, :unauthorized, "The email address or password you entered is not valid"}
      {:error, :email_not_confirmed} -> {:error, :forbidden, "The email address you entered has not yet been confirmed"}
      user ->
        case verify_password(password, user.password_hash) do
          true -> {:ok, user, sign_token(user)}
          _ -> {:error, :unauthorized, "The email address or password you entered is not valid"}
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

  def get_user_for_resend_verification(email) do
    case Repo.get_by(User, email: email) do
      nil -> {:error, :not_found, "The email address you have entered is not valid"}
      user ->
        case user.confirmed_at do
          nil -> {:ok, user}
          _ -> {:error, :not_found, "The email address you have entered is not valid"}
        end
    end
  end

  def get_user_for_password_reset(email) do
    case Repo.get_by(User, email: email) do
      nil -> {:error, :not_found, "The email address you have entered is not valid"}
      user -> {:ok, user}
    end
  end

  defp get_user_for_authentication(email) do
    case Repo.get_by(User, email: email) do
      nil -> nil
      user ->
        case user.confirmed_at do
          nil -> {:error, :email_not_confirmed}
          _datetime -> user
        end
    end
  end

  defp verify_password(password, pw_hash) do
    Comeonin.Bcrypt.checkpw(password, pw_hash)
  end

  defp sign_token(user) do
    {:ok, token, _claims} = ConsoleWeb.Guardian.encode_and_sign(user)
    token
  end

  defp mark_email_confirmed(user) do
    user
    |> User.confirm_email_changeset()
    |> Repo.update()
  end
end
