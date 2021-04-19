defmodule Console.Organizations.OrganizationResolver do
  alias Console.Repo
  alias Console.Organizations.Organization
  alias Console.Organizations

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_user: current_user, current_membership: current_membership}}) do
    organizations =
      case current_user.super do
        true ->
          Organization |> Repo.paginate(page: page, page_size: page_size)
        _ ->
          orgs = Organizations.get_organizations_with_devices(current_user)
          %{
            entries: orgs,
          }
      end

    entries =
      case current_membership.role do
        "read" ->
          Enum.map(organizations.entries, fn o ->
            Map.drop(o, [:webhook_key])
          end)
        _ -> organizations.entries
      end

    {:ok, Map.put(organizations, :entries, entries)}
  end

  def find(%{id: id}, %{context: %{current_user: current_user}}) do
    organization = Organizations.get_organization!(current_user, id)
    {:ok, Map.drop(organization, [:webhook_key])}
  end

  def all(_, %{context: %{current_user: current_user}}) do
    organizations =
      Organizations.get_organizations_with_devices(current_user)
      |> Enum.map(fn o ->
        Map.drop(o, [:webhook_key])
      end)
        
    {:ok, organizations}
  end
end
