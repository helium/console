defmodule Console.Organizations.OrganizationResolver do
  alias Console.Repo
  alias Console.Organizations.Organization
  alias Console.Organizations

  def paginate(%{page: page, page_size: page_size}, %{context: %{current_user: current_user}}) do
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

    {:ok, organizations}
  end

  def find(%{id: id}, %{context: %{current_user: current_user}}) do
    organization = Organizations.get_organization!(current_user, id)
    {:ok, organization}
  end

  def all(_, %{context: %{current_user: current_user}}) do
    organizations = Organizations.get_organizations_with_devices(current_user)
    {:ok, organizations}
  end
end
