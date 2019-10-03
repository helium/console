defmodule Console.Teams.OrganizationResolver do
  alias Console.Repo
  alias Console.Teams.Membership

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
