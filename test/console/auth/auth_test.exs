defmodule Console.AuthTest do
  use Console.DataCase

  alias Console.Auth
  alias Console.Auth.TwoFactor

  import Console.Factory

  describe "users" do
    alias Console.Auth.User

    @valid_attrs %{email: "test@hello.com", password: "sharkfed"}
    # @update_attrs %{email: "some updated email", password_hash: "some updated password_hash"}
    @invalid_attrs %{email: "notanemail", password: "short"}

    def user_fixture(attrs \\ %{}) do
      {:ok, user} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Auth.create_user()

      user
    end

    test "create_user/1 with valid data creates a user" do
      team_attrs = %{name: "Test Team"}
      assert {:ok, %User{} = user} = Auth.create_user(@valid_attrs, team_attrs)
      assert user.email == "test@hello.com"
      user = Auth.fetch_assoc(user)
      assert List.first(user.teams).name == team_attrs.name
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Auth.create_user(@invalid_attrs)
    end

    test "generate_session_token/1 encodes the current team in the token" do
      user = insert(:user)
      {:ok, team} = Console.Teams.create_team(user, %{name: "Test Team"})
      token = Console.Auth.generate_session_token(user)
      {:ok, claims} = ConsoleWeb.Guardian.decode_and_verify(token)
      assert claims["team"] == team.id
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
      {:ok, _} = Console.Teams.create_team(user, %{name: "Test Team"})
      assert user.last_2fa_skipped_at === nil
      assert {:ok, %User{last_2fa_skipped_at: datetime}} = Auth.update_2fa_last_skipped(user)
      assert datetime !== nil
    end

    test "enable_2fa/3 returns the proper twofactor object" do
      user = insert(:user)
      {:ok, _} = Console.Teams.create_team(user, %{name: "Test Team"})
      assert Auth.fetch_assoc(user).twofactor === nil
      assert {:ok, %TwoFactor{}} = Auth.enable_2fa(user, "SECRETKEY", ["1234567890"])
      assert Auth.fetch_assoc(user).twofactor !== nil
    end

    test "create_user_via_invitation/2 creates user and marks invitation used" do
      team = insert(:team)
      invitation = insert(:invitation, team_id: team.id)
      attrs = params_for(:user, password: "sekret")

      assert {:ok, %User{} = user} = Auth.create_user_via_invitation(invitation, attrs)
      user = Auth.fetch_assoc(user)
      assert Console.Teams.user_has_access?(user, team)
      assert Console.Teams.get_invitation!(invitation.id).pending == false
    end
  end
end
