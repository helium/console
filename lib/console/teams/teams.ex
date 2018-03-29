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

    {:ok, %{team: team}} =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:team, team_changeset)
      |> Ecto.Multi.run(:membership, fn %{team: team} ->
        %Membership{}
        |> Membership.join_changeset(user, team)
        |> Repo.insert()
      end)
      |> Repo.transaction()

    {:ok, team}
  end

  def fetch_assoc(team) do
    Repo.preload(team, [:users])
  end
end
