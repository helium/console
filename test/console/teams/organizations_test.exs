defmodule Console.OrganizationsTest do
  use Console.DataCase

  alias Console.Organizations
  alias Console.Channels
  alias Console.Devices
  alias Console.Organizations
  alias Console.Organizations.Organization
  alias Console.Organizations.Membership
  alias Console.Organizations.Invitation

  import Console.Factory

  @valid_attrs %{"name" => "some name"}
  @invalid_attrs %{"name" => nil}
  @invalid_attrs2 %{"name" => ""}
  @invalid_attrs3 %{"name" => "a"}
  @channel_creds %{"a field" => "a value", "endpoint" => "http://test.com/api"}
  @device_attrs %{"mac" => "some mac", "name" => "some name"}
  @channel_attrs %{"active" => true, "credentials" => @channel_creds, "name" => "some name", "type" => "http", "type_name" => "HTTP"}

  describe "organizations" do
    test "create_organization/2 with valid data creates an org" do
      user = insert(:user)
      assert {:ok, %Organization{} = organization} = Organizations.create_organization(user, @valid_attrs)
      organization = Organizations.fetch_assoc(organization)
      assert List.first(organization.users).id == user.id
      assert Organizations.user_has_access?(user, organization)
    end

    test "create_organization/2 with invalid data fails" do
      user = insert(:user)
      assert {:error, %Ecto.Changeset{}} = Organizations.create_organization(user, @invalid_attrs)
      assert {:error, %Ecto.Changeset{}} = Organizations.create_organization(user, @invalid_attrs2)
      assert {:error, %Ecto.Changeset{}} = Organizations.create_organization(user, @invalid_attrs3)
    end

    test "join_organization/2 allows user to join" do
      user = insert(:user)
      organization = insert(:organization)
      organization = Organizations.fetch_assoc(organization)
      assert organization.users == []
      {:ok, %Membership{} = membership} = Organizations.join_organization(user, organization)
      membership = Organizations.fetch_assoc_membership(membership)
      assert membership.user.id == user.id
      assert membership.organization.id == organization.id
      assert Organizations.user_has_access?(user, organization)
      organization = Organizations.get_organization!(user, organization.id)
        |> Organizations.fetch_assoc()
      assert List.first(organization.users).id == user.id
    end

    test "create_invitation/3 allows invites to org" do
      user = insert(:user)
      organization = insert(:organization)
      {:ok, %Invitation{} = invitation} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "admin"})
      assert invitation.organization_id == organization.id
      assert invitation.inviter_id == user.id
      assert {:error, %Ecto.Changeset{}} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com"})
      assert {:error, %Ecto.Changeset{}} = Organizations.create_invitation(user, organization, %{"email" => "test", "role" => "admin"})
      assert {:error, %Ecto.Changeset{}} = Organizations.create_invitation(user, organization, %{"role" => "admin"})
      assert {:error, %Ecto.Changeset{}} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "manager"})
    end

    test "mark_invitation_used/1 turns invitations to used" do
      user = insert(:user)
      organization = insert(:organization)
      {:ok, %Invitation{} = invitation} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "admin"})
      assert invitation.pending
      {:ok, %Invitation{} = invitation} = Organizations.mark_invitation_used(invitation)
      assert not invitation.pending
    end

    test "update_membership/2 changes membership role type" do
      user = insert(:user)
      organization = insert(:organization)
      {:ok, %Membership{} = membership} = Organizations.join_organization(user, organization)
      assert membership.role == "manager"
      {:ok, %Membership{} = membership} = Organizations.update_membership(membership, %{"role" => "admin"})
      assert membership.role != "manager"
      assert membership.role == "admin"
    end

    test "delete_membership/1 removes users from org" do
      user = insert(:user)
      organization = insert(:organization)
      {:ok, %Membership{} = membership} = Organizations.join_organization(user, organization)
      assert Organizations.user_has_access?(user, organization)
      Organizations.delete_membership(membership)
      assert not Organizations.user_has_access?(user, organization)
    end

    test "delete_invitation/1 removes invites from org" do
      user = insert(:user)
      organization = insert(:organization)
      {:ok, %Invitation{} = invitation} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "admin"})
      {:error, %Ecto.Changeset{}} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "admin"})
      assert {:ok, %Invitation{}} = Organizations.delete_invitation(invitation)
      assert_raise Ecto.NoResultsError, fn -> Organizations.get_invitation!(invitation.id) end
      {:ok, %Invitation{}} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "manager"})
    end

    test "delete_organization/1 deletes the org and resources" do
      user = insert(:user)
      assert {:ok, %Organization{} = organization} = Organizations.create_organization(user, @valid_attrs)
      assert {:ok, channel} = Channels.create_channel(organization, Map.put(@channel_attrs, "organization_id", organization.id))
      assert {:ok, device} = Devices.create_device(Map.put(@device_attrs, "organization_id", organization.id))
      organization = Organizations.fetch_assoc(organization)
      assert 1 == organization.channels |> Enum.count()
      assert 1 == organization.devices |> Enum.count()
      Organizations.delete_organization(organization)

      assert [] == Devices.list_devices()
      assert [] == Channels.list_channels()
    end
  end
end
