defmodule ConsoleWeb.RouterSessionControllerTest do
  use ConsoleWeb.ConnCase

  import Console.Factory

  describe "sessions" do
    test "router can get session token", %{conn: conn} do
      assert_error_sent 400, fn ->
        build_conn() |> post("/api/router/sessions")
      end # no router secret

      resp_conn = build_conn() |> post("/api/router/sessions", %{ "secret" => "nope" })
      assert response(resp_conn, 401) == "{\"message\":\"invalid_secret\"}"

      resp_conn = build_conn() |> post("/api/router/sessions", %{ "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/" })
      token = json_response(resp_conn, 201)
      assert Map.get(token, "jwt") != nil
    end

    test "router can refresh session token", %{conn: conn} do
      assert_error_sent 500, fn ->
        build_conn() |> post("/api/router/sessions/refresh", %{ "jwt" => "agsafsafs" })
      end # fake token

      resp_conn = build_conn() |> post("/api/router/sessions", %{ "secret" => "1524243720:2JD3juUA9RGaOf3Fpj7fNOylAgZ/jAalgOe45X6+jW4sy9gyCy1ELJrIWKvrgMx/" })
      token = json_response(resp_conn, 201)
      assert {:ok, _ } = ConsoleWeb.Guardian.decode_and_verify(token["jwt"])

      resp_conn = build_conn() |> post("/api/router/sessions/refresh", %{ "jwt" => token["jwt"] })
      refreshed_token = json_response(resp_conn, 201)
      assert refreshed_token["jwt"] != token["jwt"] #refreshed token
      assert {:ok, _ } = ConsoleWeb.Guardian.decode_and_verify(refreshed_token["jwt"])
    end
  end
end
