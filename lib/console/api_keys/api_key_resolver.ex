defmodule Console.ApiKeys.ApiKeyResolver do
  alias Console.Repo
  import Ecto.Query

  alias Console.ApiKeys.ApiKey
  alias Console.Auth.User

  def all(_, %{context: %{current_organization: current_organization, current_user: current_user}}) do
    keys = ApiKey
      |> where([k], k.organization_id == ^current_organization.id)
      |> preload([:user])
      |> Repo.all()

    keys = Enum.map(keys, fn k ->
      k = Map.put(k, :user, k.user.email)
    end)

    {:ok, keys}
  end
end
