defmodule Console.Teams.OrganizationResolver do
  alias Console.Repo
  alias Console.Teams.Membership
  alias Console.Teams.Organizations

  def find(%{id: id}, %{context: %{current_user: current_user}}) do
    if current_user.super do
      organization = Organizations.get_organization!(id)
      {:ok, organization}
    else
      organization =
        Ecto.assoc(current_user, :organizations)
        |> Repo.get!(id)
      {:ok, organization}
    end
  end

  def all(_, %{context: %{current_user: current_user}}) do
    if current_user.super do
      organizations = Organizations.list_organizations
      {:ok, organizations}
    else
      organizations =
        Ecto.assoc(current_user, :organizations)
        |> Repo.all()
      {:ok, organizations}
    end
  end

  def get_teams(_, %{source: resource}) do
    teams =
      Ecto.assoc(resource, :teams)
      |> Repo.all()
    {:ok, teams}
  end
end
