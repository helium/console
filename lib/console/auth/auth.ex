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
  def create_user(user_attrs \\ %{}, team_attrs \\ %{}) do
    user_changeset =
      %User{}
      |> User.registration_changeset(user_attrs)

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:user, user_changeset)
      |> Ecto.Multi.run(:team, fn %{user: user} ->
        Console.Teams.create_team(user, team_attrs)
      end)
      |> Repo.transaction()

    case result do
      {:ok, %{user: user}} -> {:ok, user}
      {:error, _, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  def fetch_assoc(%User{} = user) do
    Repo.preload(user, [:teams])
  end

  def authenticate(%{"email" => email, "password" => password}) do
    case get_user_for_authentication(email) do
      nil -> {:error, :unauthorized, "The email address or password you entered is not valid"}
      {:error, :email_not_confirmed} -> {:error, :forbidden, "The email address you entered has not yet been confirmed"}
      user ->
        case verify_password(password, user.password_hash) do
          true -> {:ok, user, generate_session_token(user)}
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
           nil -> generate_new_confirmation_token(user)
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

  def change_password(attrs) do
    case ConsoleWeb.Guardian.decode_and_verify(attrs["token"]) do
      {:ok, jwt} ->
        case Repo.get_by(User, id: jwt["sub"]) do
          nil -> {:error, :unauthorized, "Password reset link may have expired, please check your email or request a new password reset link"}
          user -> confirm_password_change(user, attrs)
        end
      {:error, _} -> {:error, :unauthorized, "Password reset link may have expired, please check your email or request a new password reset link"}
    end
  end

  def enable_2fa(user, secret2FA) do
    user
    |> User.enable_2fa_changeset(secret2FA)
    |> Repo.update()
  end

  def verify_captcha(recaptcha) do
    if Application.get_env(:console, :env) === :test do
      true
    else
      body = {:form, [secret: Application.get_env(:console, :recaptcha_secret), response: recaptcha]}
      case HTTPoison.post "https://www.google.com/recaptcha/api/siteverify", body do
        {:ok, response} ->
          case response.status_code do
            200 ->
              responseBody = Poison.decode!(response.body)
              case responseBody["success"] do
                true -> true
                _ -> {:error, :unauthorized, "Your Captcha code is invalid, please try again"} #if recaptcha does not process correctly or is a robot
              end
            _ -> {:error, :unauthorized, "An unexpected error has occurred, please try again"} #if google fails to respond correctly
          end
        _ -> {:error, :unauthorized, "An unexpected error has occured, please try again"} #if poison fails to send the request
      end
    end
  end

  def generate_session_token(user) do
    {:ok, token, _claims} = ConsoleWeb.Guardian.encode_and_sign(user)
    token
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

  defp mark_email_confirmed(user) do
    user
    |> User.confirm_email_changeset()
    |> Repo.update()
  end

  defp confirm_password_change(user, attrs) do
    user
    |> User.change_password_changeset(attrs)
    |> Repo.update()
  end

  defp generate_new_confirmation_token(user) do
    user
    |> User.generate_new_confirmation_changeset()
    |> Repo.update()
  end
end
