defmodule Console.ApiKeys.ApiKeyResolver do
  alias Console.Repo
  import Ecto.Query

  alias Console.ApiKeys.ApiKey
  alias Console.Auth.User
  alias Console.Organizations.Membership

  def all(_, %{context: %{current_organization: current_organization, current_user: current_user}}) do
    keys =
      ApiKey
      |> join(
        :inner,
        [k],
        m in Membership,
        on: m.user_id == k.user_id and m.organization_id == ^current_organization.id
      )
      |> where([k], k.organization_id == ^current_organization.id)
      |> select(
        [k, m],
        %{
          id: k.id,
          name: k.name,
          role: k.role,
          inserted_at: k.inserted_at,
          user: m.email,
          active: k.active
        }
      )
      |> Repo.all()

    {:ok, keys}
  end
end
