defmodule ConsoleWeb.SessionControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Auth
  # alias Console.Auth.User
  import Console.FactoryHelper

  describe "Login with no two factor" do
    setup [:unauthenticated_user]

    test "User with no two factor gets correct response", %{conn: conn, user: user} do
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
  end

  describe "Login with two factor" do
    setup [:authenticate_user]

    test "User with enabled two factor gets correct response", %{conn: conn, user: user} do
      Auth.enable_2fa(user, "1234567890", [:crypto.strong_rand_bytes(16) |> Base.encode32 |> binary_part(0, 16)])

      session_params = %{email: user.email, password: "pa$$word ha$h"}
      conn = post conn, session_path(conn, :create), session: session_params, recaptcha: "recaptcha"
      assert json_response(conn, 201)["jwt"] === nil
      assert json_response(conn, 201)["skip2fa"] === nil
      assert json_response(conn, 201)["user"]["twoFactorEnabled"] === true
    end
  end
end
