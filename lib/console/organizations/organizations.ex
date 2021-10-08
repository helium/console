defmodule Console.Organizations do
  import Ecto.Query, warn: false
  alias Console.Repo

  alias Console.Organizations.Organization
  alias Console.Devices
  alias Console.Organizations.Membership
  alias Console.Organizations.Invitation
  alias Console.Auth.User
  alias Console.ApiKeys.ApiKey

  def get_all do
    Repo.all(Organization)
  end

  def list_organizations do
    query = from o in Organization,
      select: %{id: o.id, name: o.name, role: "admin", dc_balance: o.dc_balance, inserted_at: o.inserted_at, app_eui: o.default_app_eui}
    Repo.all(query)
  end

  def get_organizations(%{} = current_user) do
    query = from o in Organization,
      join: m in Membership, on: m.organization_id == o.id,
      where: m.user_id == ^current_user.id,
      select: %{id: o.id, name: o.name, role: m.role, dc_balance: o.dc_balance, inserted_at: o.inserted_at, app_eui: o.default_app_eui}
    Repo.all(query)
  end

  def get_organizations_with_devices(%User{} = current_user) do
    query = from o in Organization,
      join: m in Membership, on: m.organization_id == o.id,
      where: m.user_id == ^current_user.id,
      select: %{id: o.id, name: o.name, role: m.role, dc_balance: o.dc_balance, inserted_at: o.inserted_at, active: o.active, received_free_dc: o.received_free_dc, webhook_key: o.webhook_key},
      order_by: [asc: :name]

    organizations = Repo.all(query)

    organizations =
      Enum.map(organizations, fn org ->
        devices = Devices.get_devices(org.id)
        inactive_devices = Enum.filter(devices, fn device -> !device.active end)
        inactive_count = length(inactive_devices)
        active_count = length(devices) - inactive_count

        org
        |> Map.put(:inactive_count, inactive_count)
        |> Map.put(:active_count, active_count)
      end)

    organizations
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

  def get_organization_and_lock_for_dc(org_id) do
    Organization
      |> where([o], o.id == ^org_id)
      |> lock("FOR UPDATE NOWAIT")
      |> Repo.one()
  end

  def get_discovery_mode_org() do
    Organization
      |> where([o], o.name == "Discovery Mode (Helium)")
      |> Repo.one()
  end

  def get_organization!(id) do
    Repo.get!(Organization, id)
  end

  def get_organization(id) do
    Repo.get(Organization, id)
  end

  def get_invitation!(id) do
    Repo.get!(Invitation, id)
  end

  def get_membership!(id) do
    Repo.get!(Membership, id)
  end

  def get_membership(id) do
    Repo.get(Membership, id)
  end

  def get_membership!(%Organization{} = organization, id) do
    Repo.get_by!(Membership, [id: id, organization_id: organization.id])
  end

  def get_membership!(%User{id: user_id}, %Organization{id: organization_id}) do
    query = from m in Membership,
      where: m.user_id == ^user_id and m.organization_id == ^organization_id
    Repo.one(query)
  end

  def get_invitation!(%Organization{} = organization, id) do
    Repo.get_by!(Invitation, [id: id, organization_id: organization.id])
  end

  def get_last_viewed_org_membership(%User{id: user_id}) do
    query = from m in Membership,
      where: m.user_id == ^user_id,
      order_by: [desc: :updated_at]
    Repo.all(query)
  end

  def get_administrators(%Organization{id: organization_id}) do
    query = from m in Membership,
      where: m.organization_id == ^organization_id and m.role == ^"admin"
    Repo.all(query)
  end

  def get_memberships_by_organization_and_role(organization_id, roles) do
    query = from m in Membership,
      where: m.organization_id == ^organization_id and m.role in ^roles
    Repo.all(query)
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

  def create_organization(%{} = user, attrs \\ %{}) do
    count = get_organizations(user) |> Enum.count()

    if count > 499 do
      {:error, :forbidden, "Maximum number of organizations reached"}
    else
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
        {:ok, %{organization: organization}} -> {:ok, organization}
        {:error, :organization, %Ecto.Changeset{} = changeset, _} -> {:error, changeset}
      end
    end
  end

  def update_organization(%Organization{} = organization, attrs) do
    organization
    |> Organization.update_changeset(attrs)
    |> Repo.update()
  end

  def update_organization!(%Organization{} = organization, attrs) do
    organization
    |> Organization.update_changeset(attrs)
    |> Repo.update!()
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
    if "role" in attrs and attrs["role"] != "admin" do
      Repo.transaction(fn ->
        from(key in ApiKey, where: key.user_id == ^membership.user_id and key.organization_id == ^membership.organization_id)
        |> Repo.delete_all()

        membership
        |> Membership.update_changeset(attrs)
        |> Repo.update!()
      end)
    else
      membership
      |> Membership.update_changeset(attrs)
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

      Repo.delete!(membership)
    end)
  end

  def delete_organization(%Organization{} = organization) do
    Repo.transaction(fn ->
      from(key in ApiKey, where: key.organization_id == ^organization.id)
      |> Repo.delete_all()

      Repo.delete!(organization)
    end)
  end

  def send_dc_to_org(amount, %Organization{} = from_org, %Organization{} = to_org) do
    Repo.transaction(fn ->
      locked_from_org = get_organization_and_lock_for_dc(from_org.id)
      from_org_updated = update_organization!(locked_from_org, %{
        "dc_balance" => locked_from_org.dc_balance - amount,
        "dc_balance_nonce" => locked_from_org.dc_balance_nonce + 1
      })

      locked_to_org = get_organization_and_lock_for_dc(to_org.id)
      locked_to_org_dc_balance =
        case locked_to_org.dc_balance do
          nil -> amount
          _ -> locked_to_org.dc_balance + amount
        end
      to_org_updated = update_organization!(locked_to_org, %{
        "dc_balance" => locked_to_org_dc_balance,
        "dc_balance_nonce" => locked_to_org.dc_balance_nonce + 1
      })

      {:ok, from_org_updated, to_org_updated}
    end)
  end

  def get_all_memberships(email) do
    query = from m in Membership,
      where: m.email == ^email
    Repo.all(query)
  end

  def update_all_memberships(user_ids, user_id) do
    from(m in Membership, where: m.user_id in ^user_ids)
    |> Repo.update_all(set: [user_id: user_id])
  end
end
