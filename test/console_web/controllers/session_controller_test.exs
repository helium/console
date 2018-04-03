defmodule ConsoleWeb.SessionControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Auth
  # alias Console.Auth.User
  import Console.Factory

  @create_attrs %{email: "test@hello.com", password: "some password"}
  # @invalid_attrs %{email: "notanemail", password: "pass"}

  def fixture(:user) do
    {:ok, user} = Auth.create_user(@create_attrs)
    user
  end

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "Login" do
    test "User with no two factor gets correct response", %{conn: conn} do
      user = insert(:user)
      Console.Teams.create_team(user, %{name: "UserTeam"})
      session_params = %{email: user.email, password: "pa$$word ha$h"}
      conn = post conn, session_path(conn, :create), session: session_params, recaptcha: "recaptcha"

      assert json_response(conn, 201)["jwt"] !== nil
      assert json_response(conn, 201)["skip2fa"] === false
      assert json_response(conn, 201)["user"]["twoFactorEnabled"] === false

      Auth.update_2fa_last_skipped(user)
      conn = post conn, session_path(conn, :create), session: session_params, recaptcha: "recaptcha"

      assert json_response(conn, 201)["jwt"] !== nil
      assert json_response(conn, 201)["skip2fa"] === true
      assert json_response(conn, 201)["user"]["twoFactorEnabled"] === false
    end

    test "User with enabled two factor gets correct response", %{conn: conn} do
      user = insert(:user)
      Console.Teams.create_team(user, %{name: "UserTeam"})
      Auth.enable_2fa(user, "1234567890", [:crypto.strong_rand_bytes(16) |> Base.encode32 |> binary_part(0, 16)])

      session_params = %{email: user.email, password: "pa$$word ha$h"}
      conn = post conn, session_path(conn, :create), session: session_params, recaptcha: "recaptcha"
      assert json_response(conn, 201)["jwt"] === nil
      assert json_response(conn, 201)["skip2fa"] === nil
      assert json_response(conn, 201)["user"]["twoFactorEnabled"] === true
    end
  end

end
