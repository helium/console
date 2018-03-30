defmodule Console.Teams do
  @moduledoc """
  The Teams context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Teams.Team
  alias Console.Teams.Membership

  def create_team(user, attrs \\ %{}) do
    team_changeset =
      %Team{}
      |> Team.changeset(attrs)

    membership_fn = fn %{team: team} ->
      %Membership{}
      |> Membership.join_changeset(user, team)
      |> Repo.insert()
    end

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:team, team_changeset)
      |> Ecto.Multi.run(:membership, membership_fn)
      |> Repo.transaction()

    case result do
      {:ok, %{team: team}} -> {:ok, team}
      {:error, :team, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  def fetch_assoc(team) do
    Repo.preload(team, [:users])
  end
end
