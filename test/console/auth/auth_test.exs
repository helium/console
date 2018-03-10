defmodule Console.AuthTest do
  use Console.DataCase

  alias Console.Auth

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
      assert {:ok, %User{} = user} = Auth.create_user(@valid_attrs)
      assert user.email == "test@hello.com"
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Auth.create_user(@invalid_attrs)
    end
  end
end
