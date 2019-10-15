defmodule Console.Teams.OrganizationResolver do
  alias Console.Repo
  alias Console.Teams.Membership

  def find(%{id: id}, %{context: %{current_user: current_user}}) do
    organization =
      Ecto.assoc(current_user, :organizations)
      |> Repo.get!(id)
    {:ok, organization}
  end

  def all(_, %{context: %{current_user: current_user}}) do
    organizations =
      Ecto.assoc(current_user, :organizations)
      |> Repo.all()
    {:ok, organizations}
  end

  def get_teams(_, %{source: resource}) do
    teams =
      Ecto.assoc(resource, :teams)
      |> Repo.all()
    {:ok, teams}
  end
end
