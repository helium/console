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

  def get_invitation!(id) do
    Repo.get!(Invitation, id)
  end

  def get_membership!(id) do
    Repo.get!(Membership, id)
  end

  def get_membership!(%User{id: user_id}, %Team{id: team_id}) do
    Repo.get_by!(Membership, user_id: user_id, team_id: team_id)
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

  def create_team(%User{} = user, attrs) do
    team_changeset =
      %Team{}
      |> Team.create_changeset(attrs)

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

  def join_team(%User{} = user, %Team{} = team, role \\ "viewer") do
    %Membership{}
    |> Membership.join_changeset(user, team, role)
    |> Repo.insert()
  end

  def fetch_assoc(%Team{} = team, assoc \\ [:users, :devices, :gateways, :channels]) do
    Repo.preload(team, assoc)
  end

  def fetch_assoc_invitation(%Invitation{} = team, assoc \\ [:inviter, :team]) do
    Repo.preload(team, assoc)
  end

  def fetch_assoc_membership(%Membership{} = team, assoc \\ [:user, :team]) do
    Repo.preload(team, assoc)
  end

  def current_team_for(%User{} = user) do
    case Auth.fetch_assoc(user).organizations do
      [] -> List.last(Auth.fetch_assoc(user).teams)
      _ ->
        organization = List.last(Auth.fetch_assoc(user).organizations)
        Organizations.fetch_assoc(organization).teams
        |> List.last()
    end
  end

  def create_invitation(%User{} = inviter, %Team{} = team, attrs) do
    attrs = Map.merge(attrs, %{"inviter_id" => inviter.id, "team_id" => team.id})

    %Invitation{}
    |> Invitation.create_changeset(attrs)
    |> Repo.insert()
  end

  def mark_invitation_used(%Invitation{} = invitation) do
    invitation
    |> Invitation.used_changeset()
    |> Repo.update()
  end

  def valid_invitation_token?(token) do
    with %Invitation{} = invitation <- Repo.get_by(Invitation, token: token) do
      {invitation.pending, invitation}
    else nil -> {false, nil}
    end
  end

  def update_membership(%Membership{} = membership, attrs) do
    membership
    |> Membership.changeset(attrs)
    |> Repo.update()
  end

  def delete_invitation(%Invitation{} = invitation) do
    Repo.delete(invitation)
  end

  def delete_membership(%Membership{} = membership) do
    Repo.delete(membership)
  end

  def delete_team(%Team{} = team) do
    Repo.delete(team)
  end
end
