defmodule Console.OrganizationsTest do
  use Console.DataCase

  alias Console.Teams.Organizations
  alias Console.Teams.Organization
  alias Console.Teams.Membership
  alias Console.Teams.Invitation

  import Console.Factory

  @valid_attrs %{"name" => "some name"}
  @invalid_attrs %{"name" => nil}
  @invalid_attrs2 %{"name" => ""}
  @invalid_attrs3 %{"name" => "a"}

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
      assert {:error, %Ecto.Changeset{}} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "viewer"})
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
      assert membership.role == "viewer"
      {:ok, %Membership{} = membership} = Organizations.update_membership(membership, %{"role" => "admin"})
      assert membership.role != "viewer"
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
      {:ok, %Invitation{}} = Organizations.create_invitation(user, organization, %{"email" => "test@test.com", "role" => "analyst"})
    end
  end
end
