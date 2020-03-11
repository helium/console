defmodule Console.ApiKeys do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.ApiKeys.ApiKey

  def get_api_key!(organization, id) do
     Repo.get_by!(ApiKey, [id: id, organization_id: organization.id])
  end

  def get_api_key(key) do
     Repo.get_by(ApiKey, [key: key])
  end

  def get_user_api_keys(user) do
    ApiKey
      |> where([k], k.user_id == ^user.id)
      |> Repo.all()
  end

  def create_api_key(organization, user, attrs \\ %{}) do
    attrs = Map.merge(attrs, %{"organization_id" => organization.id, "user_id" => user.id})

    %ApiKey{}
    |> ApiKey.create_changeset(attrs)
    |> Repo.insert()
  end

  def delete_api_key(%ApiKey{} = api_key) do
    Repo.delete(api_key)
  end
end
