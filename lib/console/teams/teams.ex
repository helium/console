defmodule Console.Teams do
  @moduledoc """
  The Teams context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Teams.Team
  alias Console.Teams.Membership
  alias Console.Auth
  alias Console.Auth.User

  def get_team!(%User{} = current_user, id) do
    Ecto.assoc(current_user, :teams) |> Repo.get!(id)
  end

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

  def fetch_assoc(team, assoc \\ [:users, :devices, :gateways, :channels]) do
    Repo.preload(team, assoc)
  end

  def current_team_for(%User{} = user) do
    # TODO: use a timestamp on membership to track the last-viewed team
    List.last(Auth.fetch_assoc(user).teams)
  end
end
