defmodule Console.Organizations do
  import Ecto.Query, warn: false
  alias Ecto.UUID
  alias Console.Repo

  alias Console.Organizations.Organization
  alias Console.Organizations
  alias Console.Organizations.Membership
  alias Console.Organizations.Invitation
  alias Console.Auth
  alias Console.Auth.User
  alias Console.ApiKeys.ApiKey

  def list_organizations do
    Repo.all(Organization)
  end

  def get_organizations(%User{} = current_user) do
    query = from o in Organization,
      join: m in Membership, on: m.organization_id == o.id,
      where: m.user_id == ^current_user.id,
      select: %{id: o.id, name: o.name, role: m.role}
    Repo.all(query)
  end

  def get_organization!(%User{} = current_user, id) do
    if current_user.super do
      Repo.get!(Organization, id)
    else
      query = from o in Organization,
        join: m in Membership, on: m.organization_id == o.id,
        where: m.user_id == ^current_user.id and o.id == ^id
      Repo.one!(query)
    end
  end

  def get_organization(%User{} = current_user, id) do
    if current_user.super do
      Repo.get(Organization, id)
    else
      query = from o in Organization,
        join: m in Membership, on: m.organization_id == o.id,
        where: m.user_id == ^current_user.id and o.id == ^id
      Repo.one(query)
    end
  end

  def get_organization!(id) do
    Repo.get!(Organization, id)
  end

  def get_invitation!(id) do
    Repo.get!(Invitation, id)
  end

  def get_membership!(id) do
    Repo.get!(Membership, id)
  end

  def get_membership!(%Organization{} = organization, id) do
    Repo.get_by!(Membership, [id: id, organization_id: organization.id])
  end

  def get_membership!(%User{id: user_id}, %Organization{id: organization_id}) do
    query = from m in Membership,
      where: m.user_id == ^user_id and m.organization_id == ^organization_id
    Repo.one(query)
  end

  def get_current_organization(user, organization_id) do
    if user.super do
      organization = get_organization!(organization_id)
      membership = %Membership{ role: "admin" }
      %{membership: membership, organization: organization}
    else
      case get_organization(user, organization_id) do
        %Organization{} = current_organization ->
          current_membership = get_membership!(user, current_organization)
          %{membership: current_membership, organization: current_organization}
        _ ->
          :forbidden
      end
    end
  end

  def user_has_access?(%User{} = user, %Organization{} = organization) do
    query =
      from(
        m in "memberships",
        select: count(m.id),
        where: m.user_id == ^user.id and m.organization_id == type(^organization.id, :binary_id)
      )

    count = Repo.one(query)
    count > 0
  end

  def create_organization(%User{} = user, attrs \\ %{}) do
    organization_changeset =
      %Organization{}
      |> Organization.create_changeset(attrs)

    membership_fn = fn _repo, %{organization: organization} ->
      %Membership{}
      |> Membership.join_org_changeset(user, organization, "admin")
      |> Repo.insert()
    end

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:organization, organization_changeset)
      |> Ecto.Multi.run(:membership, membership_fn)
      |> Repo.transaction()

    case result do
      {:ok, %{organization: organization, membership: membership}} ->
        {:ok, %{id: organization.id, name: organization.name, role: membership.role}}
      {:error, :organization, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
    end
  end

  def join_organization(%User{} = user, %Organization{} = organization, role \\ "read") do
    %Membership{}
    |> Membership.join_org_changeset(user, organization, role)
    |> Repo.insert()
  end

  def fetch_assoc(%Organization{} = organization, assoc \\ [:channels, :users, :devices]) do
    Repo.preload(organization, assoc)
  end

  def fetch_assoc_invitation(%Invitation{} = invitation, assoc \\ [:organization]) do
    Repo.preload(invitation, assoc)
  end

  def fetch_assoc_membership(%Membership{} = membership, assoc \\ [:organization]) do
    Repo.preload(membership, assoc)
  end

  def current_organization_for(%User{} = user) do
    # TODO: use a timestamp on membership to track the last-viewed organization
    List.first(Auth.fetch_assoc(user).organizations)
  end

  def create_invitation(%User{} = inviter, %Organization{} = organization, attrs) do
    attrs = Map.merge(attrs, %{"inviter_id" => inviter.id, "organization_id" => organization.id})

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

  def valid_invitation_token_and_lock?(token) do
    lock_query = Invitation
      |> where([i], i.token == ^token)
      |> lock("FOR UPDATE NOWAIT")

    with %Invitation{} = invitation <- Repo.one(lock_query) do
      {invitation.pending, invitation}
    else nil -> {false, nil}
    end
  end

  def update_membership(%Membership{} = membership, attrs) do
    if attrs["role"] == "read" do
      Repo.transaction(fn ->
        from(key in ApiKey, where: key.user_id == ^membership.user_id and key.organization_id == ^membership.organization_id)
        |> Repo.delete_all()

        membership
        |> Membership.changeset(attrs)
        |> Repo.update()
      end)
    else
      membership
      |> Membership.changeset(attrs)
      |> Repo.update()
    end
  end

  def delete_invitation(%Invitation{} = invitation) do
    Repo.delete(invitation)
  end

  def delete_membership(%Membership{} = membership) do
    Repo.transaction(fn ->
      from(key in ApiKey, where: key.user_id == ^membership.user_id and key.organization_id == ^membership.organization_id)
      |> Repo.delete_all()
      Repo.delete(membership)
    end)
  end

  def delete_organization(%Organization{} = organization) do
    Repo.transaction(fn ->
      from(key in ApiKey, where: key.organization_id == ^organization.id)
      |> Repo.delete_all()
      Repo.delete(organization)
    end)
  end
end
