defmodule Console.UserTest do
  use Console.DataCase

  import Console.Factory
  describe "users" do
    alias Console.Auth.User

    test "user change_password_changeset checks password validation" do
      user = insert(:user)
      attrs = %{"password" => "", "password_confirmation" => "testing"}
      assert User.change_password_changeset(user, attrs).valid? == false

      attrs = %{"password" => "test", "password_confirmation" => ""}
      assert User.change_password_changeset(user, attrs).valid? == false

      attrs = %{"password" => "test", "password_confirmation" => "test"}
      assert User.change_password_changeset(user, attrs).valid? == false

      attrs = %{"password" => "testing", "password_confirmation" => "test"}
      assert User.change_password_changeset(user, attrs).valid? == false

      attrs = %{"password" => "testing", "password_confirmation" => "testing"}
      assert User.change_password_changeset(user, attrs).valid? == true
    end
  end
end
