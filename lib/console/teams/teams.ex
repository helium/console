defmodule Console.Teams do
  @moduledoc """
  The Teams context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Teams.Team
  alias Console.Teams.Organization
  alias Console.Teams.Organizations
  alias Console.Teams.Membership
  alias Console.Teams.Invitation
  alias Console.Auth
  alias Console.Auth.User

  def list_teams do
    Repo.all(Team)
  end

  def get_team!(%User{} = current_user, id) do
    Ecto.assoc(current_user, :teams) |> Repo.get!(id)
  end

  def get_team(%User{} = current_user, id) do
    Ecto.assoc(current_user, :teams) |> Repo.get(id)
  end

  def get_team!(id) do
    Repo.get!(Team, id)
  end

  def create_team(%User{} = user, attrs, organization) do
    team_changeset =
      %Team{}
      |> Team.create_changeset(attrs, organization)

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:team, team_changeset)
      |> Repo.transaction()

    case result do
      {:ok, %{team: team}} -> {:ok, team}
      {:error, :team, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  def fetch_assoc(%Team{} = team, assoc \\ [:devices, :gateways, :channels]) do
    Repo.preload(team, assoc)
  end

  def delete_team(%Team{} = team) do
    Repo.delete(team)
  end
end
