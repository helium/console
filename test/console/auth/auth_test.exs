defmodule Console.AuthTest do
  use Console.DataCase

  alias Console.Auth

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
      assert {:error, :not_found, "The email address you have entered is not valid"} = Auth.get_user_for_password_reset(@invalid_attrs.email)
      user = insert(:user)
      {:ok, returnedUser} = Auth.get_user_for_password_reset(user.email)
      assert returnedUser.id == user.id
    end
  end
end
