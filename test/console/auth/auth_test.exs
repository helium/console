defmodule Console.AuthTest do
  use Console.DataCase

  alias Console.Auth
  alias Console.Organizations.Organization
  alias Console.Organizations
  alias Console.Organizations.Invitation
  alias Console.Auth.TwoFactor

  import Console.Factory

  describe "users" do
    alias Console.Auth.User

    @valid_attrs %{email: "test@hello.com", password: "sharkfed"}
    # @update_attrs %{email: "some updated email", password_hash: "some updated password_hash"}
    @invalid_attrs %{email: "notanemail", password: "longenough"}
    @invalid_attrs_pw %{email: "test@hello.com", password: "short"}

    def user_fixture(attrs \\ %{}) do
      {:ok, user} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Auth.create_user()

      user
    end

    test "create_user/1 with valid data creates a user" do
      org_attrs = %{name: "Test Organization"}
      assert {:ok, %User{} = user, %Organization{}} = Auth.create_user(@valid_attrs, org_attrs)
      assert user.email == "test@hello.com"
      user = Auth.fetch_assoc(user)
      organization = List.first(user.organizations) |> Organizations.fetch_assoc()
      assert organization.name == org_attrs.name
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Auth.create_user(@invalid_attrs)
      assert {:error, %Ecto.Changeset{}} = Auth.create_user(@invalid_attrs_pw)
    end

    test "generate_session_token/1 encodes the current organization in the token" do
      org_attrs = %{name: "Test Organization"}
      assert {:ok, %User{} = user, %Organization{} = organization} = Auth.create_user(@valid_attrs, org_attrs)
      token = Auth.generate_session_token(user, organization)
      {:ok, claims} = ConsoleWeb.Guardian.decode_and_verify(token)
      assert claims["organization"] == organization.id
    end

    test "get_user_for_resend_verification/1 returns the proper data depending on user email" do
      user = insert(:user)
      assert {:error, :not_found, _} = Auth.get_user_for_resend_verification(user.email)
      assert {:error, :not_found, _} = Auth.get_user_for_resend_verification(@invalid_attrs.email)

      user = insert(:unconfirmedUser)
      {:ok, returnedUser} = Auth.get_user_for_resend_verification(user.email)
      assert returnedUser.id == user.id
    end

    test "get_user_for_password_reset/1 returns the proper data depending on user email" do
      assert {:error, :not_found, "The email address you have entered is not valid"} =
               Auth.get_user_for_password_reset(@invalid_attrs.email)

      user = insert(:user)
      {:ok, returnedUser} = Auth.get_user_for_password_reset(user.email)
      assert returnedUser.id == user.id
    end

    test "update_2fa_last_skipped/1 changes the field on user object" do
      user = insert(:user)
      assert user.last_2fa_skipped_at === nil
      assert {:ok, %User{last_2fa_skipped_at: datetime}} = Auth.update_2fa_last_skipped(user)
      assert datetime !== nil
    end

    test "enable_2fa/3 returns the proper twofactor object" do
      user = insert(:user)
      assert Auth.fetch_assoc(user).twofactor === nil
      assert {:ok, %TwoFactor{}} = Auth.enable_2fa(user, "SECRETKEY", ["1234567890"])
      assert Auth.fetch_assoc(user).twofactor !== nil
    end

    test "create_user_via_invitation/2 creates user and marks invitation used" do
      inviter = insert(:user)
      organization = insert(:organization)
      invitation = insert(:invitation, organization_id: organization.id, inviter_id: inviter.id)
      attrs = params_for(:user, password: "sekret")

      assert {:ok, %User{} = user, %Invitation{}} = Auth.create_user_via_invitation(invitation, attrs)
      user = Auth.fetch_assoc(user)
      assert Organizations.user_has_access?(user, organization)
      assert Organizations.get_invitation!(invitation.id).pending == false
    end
  end
end
