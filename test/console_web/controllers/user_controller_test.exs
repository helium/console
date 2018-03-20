defmodule ConsoleWeb.UserControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Auth
  # alias Console.Auth.User
  import Console.Factory

  @create_attrs %{email: "test@hello.com", password: "some password"}
  @invalid_attrs %{email: "notanemail", password: "pass"}

  def fixture(:user) do
    {:ok, user} = Auth.create_user(@create_attrs)
    user
  end

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "create user" do
    test "renders user when data is valid", %{conn: conn} do
      conn = post conn, user_path(conn, :create), user: @create_attrs
      assert %{"email" => "test@hello.com"} = json_response(conn, 201)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post conn, user_path(conn, :create), user: @invalid_attrs
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "resend verification email" do
    test "renders accepted when user has not been confirmed", %{conn: conn} do
      user = insert(:unconfirmedUser)
      conn = post conn, user_path(conn, :resend_verification), email: user.email
      assert "success" =  json_response(conn, 202)["status"]
    end

    test "renders error when user does not exist or is already confirmed", %{conn: conn} do
      user = insert(:user)
      conn = post conn, user_path(conn, :resend_verification), email: user.email
      assert %{"error" => ["The email address you have entered is not valid"]} =  json_response(conn, 404)["errors"]

      conn = post conn, user_path(conn, :resend_verification), email: @create_attrs.email
      assert %{"error" => ["The email address you have entered is not valid"]} =  json_response(conn, 404)["errors"]
    end
  end

  describe "forgot password email generation" do
    test "renders accepted when valid email is supplied", %{conn: conn} do
      user = insert(:user)
      conn = post conn, user_path(conn, :forgot_password), email: user.email

      assert "success" =  json_response(conn, 202)["status"]
    end

    test "renders error when user does not exist", %{conn: conn} do
      conn = post conn, user_path(conn, :forgot_password), email: @create_attrs.email
      assert %{"error" => ["The email address you have entered is not valid"]} =  json_response(conn, 404)["errors"]
    end
  end

  describe "reset password email clicked" do
    test "redirects to login when token is invalid" do
      token = "lkhgkjahkj98798kjghlkajshgklyasiut987197ghljkashgdka"
      conn = get build_conn(), "/users/reset_password/#{token}"
      assert "/login" = redirected_to(conn, 302)

      conn = get build_conn(), "/users/reset_password/"
      assert html_response(conn, 200)
    end

    test "redirects to reset_password/:token when token is valid" do
      user = insert(:user)
      {:ok, token, _claims} = ConsoleWeb.Guardian.encode_and_sign(user, %{email: user.email}, token_type: "reset_password", ttl: {1, :hour})
      conn = get build_conn(), "/users/reset_password/#{token}"

      assert redirected_to(conn, 302) === "/reset_password/#{token}"
    end
  end

  describe "change password functionality" do
    test "renders errors when invalid token is supplied", %{conn: conn} do
      user = %{
        token: "jglashdlhkgalkshklg098709q7oihkjashg"
      }
      conn = post conn, user_path(conn, :change_password), %{user: user}

      assert %{"error" => ["Password reset link may have expired, please check your email or request a new password reset link"]} = json_response(conn, 401)["errors"]
    end
  end
end
