defmodule Console.Teams do
  @moduledoc """
  The Teams context.
  """

  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Teams.Team
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

  def get_team!(id) do
    Repo.get!(Team, id)
  end

  def user_has_access?(%User{} = user, %Team{} = team) do
    query =
      from(
        m in "memberships",
        select: count(m.id),
        where: m.user_id == type(^user.id, :binary_id) and m.team_id == type(^team.id, :binary_id)
      )

    count = Repo.one(query)
    count > 0
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

  def fetch_assoc(%Team{} = team, assoc \\ [:users, :devices, :gateways, :channels]) do
    Repo.preload(team, assoc)
  end

  def fetch_assoc_invitation(%Invitation{} = team, assoc \\ [:inviter, :team]) do
    Repo.preload(team, assoc)
  end

  def current_team_for(%User{} = user) do
    # TODO: use a timestamp on membership to track the last-viewed team
    List.last(Auth.fetch_assoc(user).teams)
  end

  def create_invitation(%User{} = inviter, %Team{} = team, attrs) do
    attrs = Map.merge(attrs, %{"inviter_id" => inviter.id, "team_id" => team.id})

    %Invitation{}
    |> Invitation.create_changeset(attrs)
    |> Repo.insert()
  end

  def valid_invitation_token?(token) do
    with %Invitation{} = invitation <- Repo.get_by(Invitation, token: token) do
      invitation.pending
    else nil -> false
    end
  end
end
