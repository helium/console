defmodule ConsoleWeb.TwoFactorControllerTest do
  use ConsoleWeb.ConnCase

  alias Console.Auth
  # alias Console.Auth.User
  import Console.FactoryHelper

  describe "Twofactor controller" do
    setup [:authenticate_user]

    test "generating a new secret", %{conn: conn} do
      conn = get conn, two_factor_path(conn, :new)

      assert json_response(conn, 200)["secret2fa"] !== nil
    end

    test "enabling and verifying 2fa", %{conn: conn, user: user} do
      params = %{"code" => :pot.totp("MFRGGZDFMZTWQ2LK"), "userId" => user.id, "secret2fa" => "MFRGGZDFMZTWQ2LK"}

      conn = post conn, two_factor_path(conn, :create), user: params

      assert Auth.fetch_assoc(user).twofactor !== nil
      assert json_response(conn, 202)["success_message"] !== nil
      assert json_response(conn, 202)["user"]["twoFactorEnabled"] === true
      assert json_response(conn, 202)["user"]["backup_codes"] |> Enum.count() === 10
    end

    test "verifying 2fa", %{conn: conn, user: user} do
      params = %{"code" => :pot.totp("MFRGGZDFMZTWQ2LK"), "userId" => user.id}
      Auth.enable_2fa(user, "MFRGGZDFMZTWQ2LK", ["1234567890"])

      conn = post conn, two_factor_path(conn, :verify), session: params

      assert json_response(conn, 201)["jwt"]!== nil
    end

    test "skipping 2fa", %{conn: conn, user: user} do
      conn = post conn, two_factor_path(conn, :skip), userId: user.id

      assert json_response(conn, 202)["success_message"] === "You've skipped two-factor authentication for today"
    end
  end

end
