defmodule Console.Auth do
  @moduledoc """
  The Auth context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Auth.User
  alias Console.Organizations

  def list_users() do
    Repo.all(User)
  end

  def get_user_by_id(id) do
    Repo.get(User, id)
  end

  def create_user(user_attrs \\ %{}, organization_attrs \\ %{}) do
    user_changeset =
      %User{}
      |> User.registration_changeset(user_attrs)

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:user, user_changeset)
      |> Ecto.Multi.run(:organization, fn _repo, %{user: user} ->
        Organizations.create_organization(user, organization_attrs)
      end)
      |> Repo.transaction()

    case result do
      {:ok, %{user: user, organization: organization}} -> {:ok, user, organization}
      {:error, _, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  def fetch_assoc(%User{} = user, assoc \\ [:organizations]) do
    Repo.preload(user, assoc)
  end

  def get_user_by_id_and_email(user_id, email) do
    case get_user_by_id(user_id) do
      %{super: is_super} -> get_user_data_map(user_id, email, is_super)
      _ -> get_user_data_map(user_id, email)
    end
  end

  defp get_user_data_map(user_id, user_email, super_user \\ false) do
    %User{id: user_id, super: super_user, email: user_email}
  end
end
