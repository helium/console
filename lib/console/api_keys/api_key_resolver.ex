defmodule Console.ApiKeys.ApiKeyResolver do
  alias Console.Repo
  import Ecto.Query

  alias Console.ApiKeys.ApiKey

  def all(_, %{context: %{current_organization: current_organization, current_user: current_user}}) do
    keys = ApiKey
      |> where([k], k.organization_id == ^current_organization.id and k.user_id == ^current_user.id)
      |> Repo.all()

    {:ok, keys}
  end
end
