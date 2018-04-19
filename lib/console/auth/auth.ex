defmodule Console.Auth do
  @moduledoc """
  The Auth context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Auth.User
  alias Console.Auth.TwoFactor
  alias Console.Teams.Invitation
  alias Console.Teams.Invitation
  alias Console.Teams.Team
  alias Console.Helpers

  def get_user_by_id!(id) do
    Repo.get!(User, id)
  end

  def user_exists?(email) do
    if user = Repo.get_by(User, email: email) do
      {true, user}
    else
      false
    end
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

  def create_user_via_invitation(%Invitation{} = inv, user_attrs \\ %{}) do
    team = Console.Teams.get_team!(inv.team_id)

    user_changeset =
      %User{}
      |> User.registration_changeset(user_attrs)

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:user, user_changeset)
      |> Ecto.Multi.run(:team, fn %{user: user} ->
        Console.Teams.join_team(user, team)
        Console.Teams.mark_invitation_used(inv)
      end)
      |> Repo.transaction()

    case result do
      {:ok, %{user: user}} -> {:ok, user}
      {:error, _, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  def authenticate(%{"email" => email, "password" => password}) do
    case get_user_for_authentication(email) do
      nil ->
        {:error, :unauthorized, "The email address or password you entered is not valid"}

      {:error, :email_not_confirmed} ->
        {:error, :forbidden, "The email address you entered has not yet been confirmed"}

      user ->
        case verify_password(password, user.password_hash) do
          true -> {:ok, fetch_assoc(user)}
          _ -> {:error, :unauthorized, "The email address or password you entered is not valid"}
        end
    end
  end

  def confirm_email(token) do
    case Repo.get_by(User, confirmation_token: token) do
      nil ->
        :error

      user ->
        case mark_email_confirmed(user) do
          {:ok, _struct} -> :ok
          _ -> :error
        end
    end
  end

  def get_user_for_resend_verification(email) do
    case Repo.get_by(User, email: email) do
      nil ->
        {:error, :not_found, "The email address you have entered is not valid"}

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
          nil ->
            {:error, :unauthorized,
             "Password reset link may have expired, please check your email or request a new password reset link"}

          user ->
            confirm_password_change(user, attrs)
        end

      {:error, _} ->
        {:error, :unauthorized,
         "Password reset link may have expired, please check your email or request a new password reset link"}
    end
  end

  def verify_captcha(recaptcha) do
    if Application.get_env(:console, :env) === :test do
      true
    else
      body =
        {:form, [secret: Application.get_env(:console, :recaptcha_secret), response: recaptcha]}

      case HTTPoison.post("https://www.google.com/recaptcha/api/siteverify", body) do
        {:ok, response} ->
          case response.status_code do
            200 ->
              responseBody = Poison.decode!(response.body)

              case responseBody["success"] do
                true ->
                  true

                # if recaptcha does not process correctly or is a robot
                _ ->
                  {:error, :unauthorized, "Your Captcha code is invalid, please try again"}
              end

            # if google fails to respond correctly
            _ ->
              {:error, :unauthorized, "An unexpected error has occurred, please try again"}
          end

        # if poison fails to send the request
        _ ->
          {:error, :unauthorized, "An unexpected error has occured, please try again"}
      end
    end
  end

  def generate_backup_codes() do
    Enum.reduce(1..10, [], fn(_, list) -> [:crypto.strong_rand_bytes(16) |> Base.encode32 |> binary_part(0, 16) | list] end)
  end

  def enable_2fa(user, secret2fa, codes) do
    hashedCodes = hash_backup_codes(codes)
    with nil <- fetch_assoc(user).twofactor do
      %TwoFactor{}
      |> TwoFactor.enable_changeset(%{user_id: user.id, secret: secret2fa, codes: hashedCodes})
      |> Repo.insert()
    end
  end

  def verify_2fa_and_backup_codes(code, userTwoFactor) do
    validAuthCode = verify_2fa_code(code, userTwoFactor.secret)
    {validBackupCode, matchingCode} = verify_backup_code(code, userTwoFactor.backup_codes)

    cond do
      (validAuthCode or (validBackupCode and remove_used_backup_code(userTwoFactor, matchingCode))) == true -> true
      (validAuthCode or validBackupCode) == false -> false
    end
  end

  def verify_2fa_code(code, secret2fa) do
    :pot.valid_totp(code, secret2fa)
  end

  def fetch_assoc(%User{} = user, assoc \\ [:twofactor, :teams]) do
    Repo.preload(user, assoc)
  end

  def generate_session_token(user) do
    current_team = List.last(fetch_assoc(user).teams)
    generate_session_token(user, current_team)
  end

  def generate_session_token(%User{} = user, %Team{} = current_team) do
    claims = %{team: current_team.id}
    {:ok, token, _claims} = ConsoleWeb.Guardian.encode_and_sign(user, claims, ttl: { 1, :day })
    token
  end

  def generate_session_token(%User{} = user, nil) do
    {:ok, token, _claims} = ConsoleWeb.Guardian.encode_and_sign(user, %{}, ttl: { 1, :day })
    token
  end

  def refresh_session_token(jwt) do
    {:ok, _, newToken} = ConsoleWeb.Guardian.refresh(jwt, ttl: { 1, :day })
    {:ok, newToken}
  end

  def should_skip_2fa_prompt?(lastSkippedTime) do
    if lastSkippedTime do
      Helpers.time_ago_more_than?(lastSkippedTime, 1, "Day")
    else
      true
    end
  end

  def update_2fa_last_verification(twoFactor) do
    twoFactor
    |> TwoFactor.update_last_verification_changeset()
    |> Repo.update()
  end

  def update_2fa_last_skipped(user) do
    user
    |> User.update_2fa_last_skipped_changeset()
    |> Repo.update()
  end

  defp get_user_for_authentication(email) do
    case Repo.get_by(User, email: email) do
      nil ->
        nil

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

  defp hash_backup_codes(codes) do
    Enum.map(codes, fn(code) -> Comeonin.Bcrypt.hashpwsalt(code) end)
  end

  defp verify_backup_code(code, backupCodes) do
    Enum.reduce(backupCodes, {false, "not found"}, fn(hash, acc) ->
      if Comeonin.Bcrypt.checkpw(code, hash) do
        {true, hash}
      else
        acc
      end
    end)
  end

  defp remove_used_backup_code(%TwoFactor{} = twoFactor, code) do
    newBackupCodes = twoFactor.backup_codes -- [code]

    case twoFactor |> TwoFactor.remove_used_backup_code_changeset(newBackupCodes) |> Repo.update() do
      {:ok, _} -> true
      {:error, _} -> false
    end
  end
end
